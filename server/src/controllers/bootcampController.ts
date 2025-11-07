import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { parsePagination, createPaginatedResponse, verifyBootcampOwnership, requireAuth } from '../lib/utils.js';

const createBootcampSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  duration: z.string(),
  format: z.array(z.enum(['IN_PERSON', 'ONLINE', 'HYBRID'])),
  ageRange: z.string(),
  subjects: z.array(z.string()),
  schedule: z.string(),
  capacity: z.number().int().positive(),
  price: z.number().nonnegative(),
  learningOutcomes: z.array(z.string()),
  weeklySchedule: z.any(), // JSON object
  prerequisites: z.array(z.string()).optional(),
});

const updateBootcampSchema = createBootcampSchema.partial();

export const getAllBootcamps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, facilitatorId, subject, format } = req.query;
    const { page, limit, skip } = parsePagination(req);

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // Default to published only for public listing
      where.status = 'PUBLISHED';
    }

    if (facilitatorId) {
      where.facilitatorId = facilitatorId;
    }

    if (subject) {
      where.subjects = {
        has: subject,
      };
    }

    if (format) {
      where.format = {
        has: format,
      };
    }

    const [bootcamps, total] = await Promise.all([
      prisma.bootcamp.findMany({
        where,
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
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.bootcamp.count({ where }),
    ]);

export const getAllBootcamps = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, facilitatorId, subject, format } = req.query;
    const { page, limit, skip } = parsePagination(req);

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      // Default to published only for public listing
      where.status = 'PUBLISHED';
    }

    if (facilitatorId) {
      where.facilitatorId = facilitatorId;
    }

    if (subject) {
      where.subjects = {
        has: subject,
      };
    }

    if (format) {
      where.format = {
        has: format,
      };
    }

    let bootcamps, total;
    try {
      [bootcamps, total] = await Promise.all([
        prisma.bootcamp.findMany({
          where,
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
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.bootcamp.count({ where }),
      ]);
    } catch (dbError: any) {
      if (dbError.code === 'P1001' || dbError.message?.includes('Can\'t reach database server')) {
        throw new AppError(
          'Database not connected. Please set up PostgreSQL. See QUICK_START_NO_DOCKER.md for instructions.',
          503
        );
      }
      throw dbError;
    }

    res.status(200).json(
      createPaginatedResponse(bootcamps, total, page, limit, 'bootcamps')
    );
  } catch (error) {
    next(error);
  }
};
};

export const getBootcamp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id },
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
        sessions: {
          include: {
            activities: true,
          },
        },
        discussionTopics: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        bootcamp,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBootcamp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createBootcampSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify user is a facilitator and get facilitator record
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    if (!facilitator) {
      throw new AppError('Only facilitators can create bootcamps', 403);
    }

    const bootcamp = await prisma.bootcamp.create({
      data: {
        ...validatedData,
        facilitatorId: facilitator.id,
        status: 'DRAFT',
        enrollmentCount: 0,
        weeklySchedule: validatedData.weeklySchedule || {},
      },
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
    });

    res.status(201).json({
      status: 'success',
      data: {
        bootcamp,
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

export const updateBootcamp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: bootcampId } = req.params;
    const validatedData = updateBootcampSchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify ownership
    await verifyBootcampOwnership(userId, bootcampId);

    const bootcamp = await prisma.bootcamp.update({
      where: { id: bootcampId },
      data: {
        ...validatedData,
        weeklySchedule: validatedData.weeklySchedule !== undefined 
          ? validatedData.weeklySchedule 
          : undefined,
      },
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
    });

    res.status(200).json({
      status: 'success',
      data: {
        bootcamp,
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

export const enrollInBootcamp = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: bootcampId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify user is a student
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Only students can enroll in bootcamps', 403);
    }

    // Check if bootcamp exists and is published
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    if (bootcamp.status !== 'PUBLISHED') {
      throw new AppError('Bootcamp is not available for enrollment', 400);
    }

    // Check capacity
    if (bootcamp.enrollmentCount >= bootcamp.capacity) {
      throw new AppError('Bootcamp is full', 400);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_bootcampId: {
          studentId: student.id,
          bootcampId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this bootcamp', 400);
    }

    // Create enrollment and update count in transaction
    const enrollment = await prisma.$transaction(async (tx) => {
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          bootcampId,
          status: 'ACTIVE',
        },
      });

      await tx.bootcamp.update({
        where: { id: bootcampId },
        data: {
          enrollmentCount: {
            increment: 1,
          },
        },
      });

      return newEnrollment;
    });

    res.status(201).json({
      status: 'success',
      data: {
        enrollment,
      },
    });
  } catch (error) {
    next(error);
  }
};

