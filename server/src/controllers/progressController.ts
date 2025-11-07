import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { parsePagination, createPaginatedResponse } from '../lib/utils.js';

const createProgressSchema = z.object({
  studentId: z.string().uuid(),
  bootcampId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  skill: z.string().min(1),
  level: z.string().min(1),
  assessmentDate: z.string().datetime(),
  evidence: z.string().min(1),
  nextSteps: z.string().min(1),
});

export const getStudentProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const { skill, bootcampId } = req.query;
    const { page, limit, skip } = parsePagination(req);

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const where: any = {
      studentId,
    };

    if (skill) {
      where.skill = skill;
    }

    if (bootcampId) {
      where.bootcampId = bootcampId;
    }

    const [progressRecords, total] = await Promise.all([
      prisma.progressRecord.findMany({
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
          Bootcamp: {
            select: {
              id: true,
              title: true,
            },
          },
          Session: {
            select: {
              id: true,
              day: true,
              theme: true,
            },
          },
        },
        orderBy: {
          assessmentDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.progressRecord.count({ where }),
    ]);

    res.status(200).json(
      createPaginatedResponse(progressRecords, total, page, limit, 'progress')
    );
  } catch (error) {
    next(error);
  }
};

export const createProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createProgressSchema.parse(req.body);
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
      throw new AppError('Only facilitators and admins can create progress records', 403);
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Verify bootcamp exists if provided
    if (validatedData.bootcampId) {
      const bootcamp = await prisma.bootcamp.findUnique({
        where: { id: validatedData.bootcampId },
      });

      if (!bootcamp) {
        throw new AppError('Bootcamp not found', 404);
      }

      // If facilitator, verify they lead this bootcamp
      if (facilitator && bootcamp.facilitatorId !== facilitator.id) {
        throw new AppError('You can only create progress records for your own bootcamps', 403);
      }
    }

    // Verify session exists if provided
    if (validatedData.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: validatedData.sessionId },
        include: {
          Bootcamp: true,
        },
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      // If facilitator, verify they lead this bootcamp
      if (facilitator && session.Bootcamp.facilitatorId !== facilitator.id) {
        throw new AppError('You can only create progress records for your own bootcamp sessions', 403);
      }

      // If bootcampId is also provided, verify they match
      if (validatedData.bootcampId && session.bootcampId !== validatedData.bootcampId) {
        throw new AppError('Session does not belong to the specified bootcamp', 400);
      }
    }

    // Get facilitator ID - use facilitator if available, otherwise we need to handle admin case
    let facilitatorId: string;
    if (facilitator) {
      facilitatorId = facilitator.id;
    } else if (isAdmin) {
      // For admins, we need to find a facilitator or create a system facilitator
      // For now, let's require admins to have a facilitator record or use a default
      // This is a design decision - admins might need facilitator records too
      throw new AppError('Admins must have facilitator access to create progress records', 403);
    } else {
      throw new AppError('Facilitator record not found', 500);
    }

    const progressRecord = await prisma.progressRecord.create({
      data: {
        studentId: validatedData.studentId,
        bootcampId: validatedData.bootcampId,
        sessionId: validatedData.sessionId,
        skill: validatedData.skill,
        level: validatedData.level,
        assessmentDate: new Date(validatedData.assessmentDate),
        facilitatorId: facilitatorId,
        evidence: validatedData.evidence,
        nextSteps: validatedData.nextSteps,
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
        Bootcamp: {
          select: {
            id: true,
            title: true,
          },
        },
        Session: {
          select: {
            id: true,
            day: true,
            theme: true,
          },
        },
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        progress: progressRecord,
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

export const getBootcampProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bootcampId } = req.params;
    const { skill, studentId } = req.query;

    // Verify bootcamp exists
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    const where: any = {
      bootcampId,
    };

    if (skill) {
      where.skill = skill;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    const progressRecords = await prisma.progressRecord.findMany({
      where,
      include: {
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
        Session: {
          select: {
            id: true,
            day: true,
            theme: true,
          },
        },
      },
      orderBy: {
        assessmentDate: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: progressRecords.length,
      data: {
        progress: progressRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRubrics = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rubrics = await prisma.assessmentRubric.findMany({
      include: {
        levels: {
          orderBy: {
            level: 'asc',
          },
        },
      },
      orderBy: {
        skill: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: rubrics.length,
      data: {
        rubrics,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRubricBySkill = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skill } = req.params;

    const rubric = await prisma.assessmentRubric.findUnique({
      where: { skill },
      include: {
        levels: {
          orderBy: {
            level: 'asc',
          },
        },
      },
    });

    if (!rubric) {
      throw new AppError('Rubric not found for this skill', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        rubric,
      },
    });
  } catch (error) {
    next(error);
  }
};

