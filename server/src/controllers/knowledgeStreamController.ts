import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const assignStreamSchema = z.object({
  knowledgeStreamId: z.string().uuid(),
});

export const getAllKnowledgeStreams = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const knowledgeStreams = await prisma.knowledgeStream.findMany({
      include: {
        levels: {
          orderBy: {
            level: 'asc',
          },
        },
        _count: {
          select: {
            studentStreams: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: knowledgeStreams.length,
      data: {
        knowledgeStreams,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeStream = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const knowledgeStream = await prisma.knowledgeStream.findUnique({
      where: { id },
      include: {
        levels: {
          orderBy: {
            level: 'asc',
          },
        },
        _count: {
          select: {
            studentStreams: true,
          },
        },
      },
    });

    if (!knowledgeStream) {
      throw new AppError('Knowledge stream not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        knowledgeStream,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const assignStreamToStudent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const validatedData = assignStreamSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify user is a facilitator or admin
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!facilitator && !isAdmin) {
      throw new AppError('Only facilitators and admins can assign knowledge streams', 403);
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Verify knowledge stream exists
    const knowledgeStream = await prisma.knowledgeStream.findUnique({
      where: { id: validatedData.knowledgeStreamId },
    });

    if (!knowledgeStream) {
      throw new AppError('Knowledge stream not found', 404);
    }

    // Check if already assigned
    const existingAssignment = await prisma.studentKnowledgeStream.findUnique({
      where: {
        studentId_knowledgeStreamId: {
          studentId,
          knowledgeStreamId: validatedData.knowledgeStreamId,
        },
      },
    });

    if (existingAssignment) {
      throw new AppError('Knowledge stream already assigned to this student', 400);
    }

    const assignment = await prisma.studentKnowledgeStream.create({
      data: {
        studentId,
        knowledgeStreamId: validatedData.knowledgeStreamId,
      },
      include: {
        KnowledgeStream: {
          include: {
            levels: {
              orderBy: {
                level: 'asc',
              },
            },
          },
        },
        Student: {
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

    res.status(201).json({
      status: 'success',
      data: {
        assignment,
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

export const getStudentKnowledgeStreams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const assignments = await prisma.studentKnowledgeStream.findMany({
      where: { studentId },
      include: {
        KnowledgeStream: {
          include: {
            levels: {
              orderBy: {
                level: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        KnowledgeStream: {
          name: 'asc',
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: {
        knowledgeStreams: assignments.map(assignment => assignment.KnowledgeStream),
      },
    });
  } catch (error) {
    next(error);
  }
};

