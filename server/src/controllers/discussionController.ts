import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { verifyBootcampOwnership, requireAuth, parsePagination, createPaginatedResponse } from '../lib/utils.js';

const createDiscussionSchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  prompt: z.string().min(1),
  guidance: z.string().min(1),
  expectedOutcomes: z.array(z.string()),
  tags: z.array(z.string()),
});

const updateDiscussionSchema = createDiscussionSchema.partial();

export const getBootcampDiscussions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bootcampId } = req.params;
    const { page, limit, skip } = parsePagination(req);
    const { day } = req.query;

    // Verify bootcamp exists
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    const where: any = { bootcampId };
    if (day) {
      where.day = parseInt(day as string, 10);
    }

    const [discussions, total] = await Promise.all([
      prisma.discussionTopic.findMany({
        where,
        include: {
          Bootcamp: {
            select: {
              id: true,
              title: true,
              Facilitator: {
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
          },
        },
        orderBy: {
          day: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.discussionTopic.count({ where }),
    ]);

    res.status(200).json(
      createPaginatedResponse(discussions, total, page, limit, 'discussions')
    );
  } catch (error) {
    next(error);
  }
};

export const createDiscussion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bootcampId } = req.params;
    const validatedData = createDiscussionSchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify bootcamp exists and verify ownership
    await verifyBootcampOwnership(userId, bootcampId);

    // Check if discussion topic for this day already exists
    const existingDiscussion = await prisma.discussionTopic.findFirst({
      where: {
        bootcampId,
        day: validatedData.day,
      },
    });

    if (existingDiscussion) {
      throw new AppError('A discussion topic for this day already exists', 400);
    }

    const discussion = await prisma.discussionTopic.create({
      data: {
        ...validatedData,
        bootcampId,
      },
      include: {
        Bootcamp: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        discussion,
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

export const getDiscussion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussionTopic.findUnique({
      where: { id },
      include: {
        Bootcamp: {
          include: {
            Facilitator: {
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
        },
      },
    });

    if (!discussion) {
      throw new AppError('Discussion topic not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        discussion,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDiscussion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateDiscussionSchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify discussion exists and get bootcamp info
    const discussion = await prisma.discussionTopic.findUnique({
      where: { id },
      include: {
        Bootcamp: true,
      },
    });

    if (!discussion) {
      throw new AppError('Discussion topic not found', 404);
    }

    // Verify ownership
    await verifyBootcampOwnership(userId, discussion.bootcampId);

    // If day is being updated, check for conflicts
    if (validatedData.day && validatedData.day !== discussion.day) {
      const existingDiscussion = await prisma.discussionTopic.findFirst({
        where: {
          bootcampId: discussion.bootcampId,
          day: validatedData.day,
          id: { not: id },
        },
      });

      if (existingDiscussion) {
        throw new AppError('A discussion topic for this day already exists', 400);
      }
    }

    const updatedDiscussion = await prisma.discussionTopic.update({
      where: { id },
      data: validatedData,
      include: {
        Bootcamp: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        discussion: updatedDiscussion,
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

export const deleteDiscussion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = requireAuth(req);

    // Verify discussion exists and get bootcamp info
    const discussion = await prisma.discussionTopic.findUnique({
      where: { id },
      include: {
        Bootcamp: true,
      },
    });

    if (!discussion) {
      throw new AppError('Discussion topic not found', 404);
    }

    // Verify ownership
    await verifyBootcampOwnership(userId, discussion.bootcampId);

    await prisma.discussionTopic.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

