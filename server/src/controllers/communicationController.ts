import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { requireAuth, parsePagination, createPaginatedResponse } from '../lib/utils.js';

const createCommunicationSchema = z.object({
  type: z.enum(['EMAIL', 'NOTIFICATION', 'MESSAGE', 'ANNOUNCEMENT']),
  recipientIds: z.array(z.string().uuid()).min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  status: z.enum(['DRAFT', 'SENT', 'SCHEDULED']).optional(),
  scheduledFor: z.string().datetime().optional(),
});

const updateCommunicationSchema = z.object({
  type: z.enum(['EMAIL', 'NOTIFICATION', 'MESSAGE', 'ANNOUNCEMENT']).optional(),
  recipientIds: z.array(z.string().uuid()).min(1).optional(),
  subject: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['DRAFT', 'SENT', 'SCHEDULED']).optional(),
  scheduledFor: z.string().datetime().optional(),
});

export const createCommunication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createCommunicationSchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify all recipients exist
    const recipients = await prisma.user.findMany({
      where: {
        id: { in: validatedData.recipientIds },
      },
    });

    if (recipients.length !== validatedData.recipientIds.length) {
      throw new AppError('One or more recipients not found', 404);
    }

    // Determine status
    let status: 'DRAFT' | 'SENT' | 'SCHEDULED' = validatedData.status || 'DRAFT';
    if (validatedData.scheduledFor) {
      status = 'SCHEDULED';
    } else if (!validatedData.status || validatedData.status === 'DRAFT') {
      // If no status specified and no scheduled time, default to DRAFT
      status = 'DRAFT';
    }

    const communicationData: any = {
      type: validatedData.type,
      senderId: userId,
      subject: validatedData.subject,
      content: validatedData.content,
      status,
    };

    if (validatedData.scheduledFor) {
      communicationData.scheduledFor = new Date(validatedData.scheduledFor);
    }

    if (status === 'SENT') {
      communicationData.sentAt = new Date();
    }

    // Create communication with recipients
    const communication = await prisma.communication.create({
      data: {
        ...communicationData,
        recipients: {
          create: validatedData.recipientIds.map((recipientId) => ({
            recipientId,
          })),
        },
      },
      include: {
        Sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipients: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        readReceipts: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        communication,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid input data', 400));
    } else {
      next(error);
    }
  }
};

export const getCommunications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = requireAuth(req);
    const { page, limit, skip } = parsePagination(req);
    const { type, status } = req.query;

    // Build where clause
    const where: any = {
      OR: [
        { senderId: userId },
        {
          recipients: {
            some: {
              recipientId: userId,
            },
          },
        },
      ],
    };

    if (type && typeof type === 'string') {
      where.type = type;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        include: {
          Sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          recipients: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          readReceipts: {
            where: {
              userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.communication.count({ where }),
    ]);

    res.status(200).json(
      createPaginatedResponse(communications, total, page, limit, 'communications')
    );
  } catch (error) {
    next(error);
  }
};

export const getCommunication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = requireAuth(req);

    const communication = await prisma.communication.findUnique({
      where: { id },
      include: {
        Sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipients: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        readReceipts: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!communication) {
      throw new AppError('Communication not found', 404);
    }

    // Verify user has access (sender or recipient)
    const isSender = communication.senderId === userId;
    const isRecipient = communication.recipients.some(
      (r) => r.recipientId === userId
    );

    if (!isSender && !isRecipient) {
      throw new AppError('You do not have access to this communication', 403);
    }

    res.status(200).json({
      status: 'success',
      data: {
        communication,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCommunication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateCommunicationSchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify communication exists
    const communication = await prisma.communication.findUnique({
      where: { id },
    });

    if (!communication) {
      throw new AppError('Communication not found', 404);
    }

    // Only sender can update
    if (communication.senderId !== userId) {
      throw new AppError('Only the sender can update this communication', 403);
    }

    // Cannot update if already sent
    if (communication.status === 'SENT') {
      throw new AppError('Cannot update a communication that has already been sent', 400);
    }

    // Verify recipients if updating
    if (validatedData.recipientIds) {
      const recipients = await prisma.user.findMany({
        where: {
          id: { in: validatedData.recipientIds },
        },
      });

      if (recipients.length !== validatedData.recipientIds.length) {
        throw new AppError('One or more recipients not found', 404);
      }
    }

    const updateData: any = {};

    if (validatedData.type) {
      updateData.type = validatedData.type;
    }

    if (validatedData.subject) {
      updateData.subject = validatedData.subject;
    }

    if (validatedData.content) {
      updateData.content = validatedData.content;
    }

    if (validatedData.status) {
      updateData.status = validatedData.status;
      if (validatedData.status === 'SENT' && !communication.sentAt) {
        updateData.sentAt = new Date();
      }
    }

    if (validatedData.scheduledFor) {
      updateData.scheduledFor = new Date(validatedData.scheduledFor);
      if (!validatedData.status || validatedData.status !== 'SENT') {
        updateData.status = 'SCHEDULED';
      }
    }

    // Update recipients if provided
    if (validatedData.recipientIds) {
      // Delete existing recipients
      await prisma.communicationRecipient.deleteMany({
        where: { communicationId: id },
      });

      // Create new recipients
      updateData.recipients = {
        create: validatedData.recipientIds.map((recipientId) => ({
          recipientId,
        })),
      };
    }

    const updatedCommunication = await prisma.communication.update({
      where: { id },
      data: updateData,
      include: {
        Sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        recipients: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        communication: updatedCommunication,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(new AppError('Invalid input data', 400));
    } else {
      next(error);
    }
  }
};

export const deleteCommunication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = requireAuth(req);

    // Verify communication exists
    const communication = await prisma.communication.findUnique({
      where: { id },
    });

    if (!communication) {
      throw new AppError('Communication not found', 404);
    }

    // Only sender can delete
    if (communication.senderId !== userId) {
      throw new AppError('Only the sender can delete this communication', 403);
    }

    await prisma.communication.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = requireAuth(req);

    // Verify communication exists
    const communication = await prisma.communication.findUnique({
      where: { id },
      include: {
        recipients: true,
      },
    });

    if (!communication) {
      throw new AppError('Communication not found', 404);
    }

    // Verify user is a recipient
    const isRecipient = communication.recipients.some(
      (r) => r.recipientId === userId
    );

    if (!isRecipient) {
      throw new AppError('You are not a recipient of this communication', 403);
    }

    // Check if read receipt already exists
    const existingReceipt = await prisma.readReceipt.findUnique({
      where: {
        communicationId_userId: {
          communicationId: id,
          userId,
        },
      },
    });

    if (existingReceipt) {
      res.status(200).json({
        status: 'success',
        message: 'Communication already marked as read',
        data: {
          readReceipt: existingReceipt,
        },
      });
      return;
    }

    // Create read receipt
    const readReceipt = await prisma.readReceipt.create({
      data: {
        communicationId: id,
        userId,
        readAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        readReceipt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = requireAuth(req);
    const { type } = req.query;

    // Get all communications where user is a recipient
    const where: any = {
      recipients: {
        some: {
          recipientId: userId,
        },
      },
      status: 'SENT',
      readReceipts: {
        none: {
          userId,
        },
      },
    };

    if (type && typeof type === 'string') {
      where.type = type;
    }

    const unreadCount = await prisma.communication.count({ where });

    res.status(200).json({
      status: 'success',
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

