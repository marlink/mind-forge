import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';
import { verifyBootcampOwnership, requireAuth, parsePagination, createPaginatedResponse } from '../lib/utils.js';

const createSessionSchema = z.object({
  day: z.number().int().positive(),
  theme: z.string().min(1),
  date: z.string().datetime(),
  startTime: z.string(),
  endTime: z.string(),
});

const updateSessionSchema = createSessionSchema.partial();

const createActivitySchema = z.object({
  time: z.string(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  materials: z.array(z.string()),
  learningObjectives: z.array(z.string()),
  facilitatorNotes: z.string().optional(),
  studentDeliverables: z.array(z.string()),
});

const updateActivitySchema = createActivitySchema.partial();

const createAttendanceSchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
  joinTime: z.string().datetime().optional(),
  leaveTime: z.string().datetime().optional(),
  engagementScore: z.number().int().min(0).max(100).optional(),
});

const updateAttendanceSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE']).optional(),
  joinTime: z.string().datetime().optional(),
  leaveTime: z.string().datetime().optional(),
  engagementScore: z.number().int().min(0).max(100).optional(),
});

export const getBootcampSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bootcampId } = req.params;
    const { page, limit, skip } = parsePagination(req);

    // Verify bootcamp exists
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: { bootcampId },
        include: {
          activities: {
            orderBy: { time: 'asc' },
          },
          _count: {
            select: {
              attendance: true,
            },
          },
        },
        orderBy: {
          day: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.session.count({ where: { bootcampId } }),
    ]);

    res.status(200).json(
      createPaginatedResponse(sessions, total, page, limit, 'sessions')
    );
  } catch (error) {
    next(error);
  }
};

export const createSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bootcampId } = req.params;
    const validatedData = createSessionSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify bootcamp exists
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
      include: {
        Facilitator: true,
      },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    // Verify user is the facilitator or admin
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!facilitator && !isAdmin) {
      throw new AppError('Only facilitators and admins can create sessions', 403);
    }

    if (facilitator && bootcamp.facilitatorId !== facilitator.id) {
      throw new AppError('You can only create sessions for your own bootcamps', 403);
    }

    // Check if session with same day already exists
    const existingSession = await prisma.session.findFirst({
      where: {
        bootcampId,
        day: validatedData.day,
      },
    });

    if (existingSession) {
      throw new AppError('A session for this day already exists', 400);
    }

    const session = await prisma.session.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        bootcampId,
      },
      include: {
        activities: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        session,
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

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { time: 'asc' },
        },
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
        attendance: {
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
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateSessionSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify session exists and get bootcamp info
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        Bootcamp: {
          include: {
            Facilitator: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is the facilitator or admin
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!facilitator && !isAdmin) {
      throw new AppError('Only facilitators and admins can update sessions', 403);
    }

    if (facilitator && session.Bootcamp.facilitatorId !== facilitator.id) {
      throw new AppError('You can only update sessions for your own bootcamps', 403);
    }

    // If day is being updated, check for conflicts
    if (validatedData.day && validatedData.day !== session.day) {
      const existingSession = await prisma.session.findFirst({
        where: {
          bootcampId: session.bootcampId,
          day: validatedData.day,
          id: { not: id },
        },
      });

      if (existingSession) {
        throw new AppError('A session for this day already exists', 400);
      }
    }

    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        activities: {
          orderBy: { time: 'asc' },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        session: updatedSession,
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

export const deleteSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify session exists and get bootcamp info
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        Bootcamp: {
          include: {
            Facilitator: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is the facilitator or admin
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!facilitator && !isAdmin) {
      throw new AppError('Only facilitators and admins can delete sessions', 403);
    }

    if (facilitator && session.Bootcamp.facilitatorId !== facilitator.id) {
      throw new AppError('You can only delete sessions for your own bootcamps', 403);
    }

    await prisma.session.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addSessionActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId } = req.params;
    const validatedData = createActivitySchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify session exists and get bootcamp info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        Bootcamp: {
          include: {
            Facilitator: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is the facilitator or admin
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!facilitator && !isAdmin) {
      throw new AppError('Only facilitators and admins can add activities', 403);
    }

    if (facilitator && session.Bootcamp.facilitatorId !== facilitator.id) {
      throw new AppError('You can only add activities to your own bootcamp sessions', 403);
    }

    const activity = await prisma.sessionActivity.create({
      data: {
        ...validatedData,
        sessionId,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        activity,
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

export const updateSessionActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId, activityId } = req.params;
    const validatedData = updateActivitySchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify session exists and get bootcamp info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        Bootcamp: true,
        activities: {
          where: { id: activityId },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.activities.length === 0) {
      throw new AppError('Activity not found', 404);
    }

    // Verify ownership
    await verifyBootcampOwnership(userId, session.bootcampId);

    const updatedActivity = await prisma.sessionActivity.update({
      where: { id: activityId },
      data: validatedData,
    });

    res.status(200).json({
      status: 'success',
      data: {
        activity: updatedActivity,
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

export const deleteSessionActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId, activityId } = req.params;
    const userId = requireAuth(req);

    // Verify session exists and get bootcamp info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        Bootcamp: true,
        activities: {
          where: { id: activityId },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.activities.length === 0) {
      throw new AppError('Activity not found', 404);
    }

    // Verify ownership
    await verifyBootcampOwnership(userId, session.bootcampId);

    await prisma.sessionActivity.delete({
      where: { id: activityId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId, attendanceId } = req.params;
    const validatedData = updateAttendanceSchema.parse(req.body);
    const userId = requireAuth(req);

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        Bootcamp: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify attendance exists
    const attendance = await prisma.attendanceRecord.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance || attendance.sessionId !== sessionId) {
      throw new AppError('Attendance record not found', 404);
    }

    // Verify ownership
    await verifyBootcampOwnership(userId, session.bootcampId);

    const updateData: any = {};
    if (validatedData.status) {
      updateData.status = validatedData.status;
    }
    if (validatedData.joinTime) {
      updateData.joinTime = new Date(validatedData.joinTime);
    }
    if (validatedData.leaveTime) {
      updateData.leaveTime = new Date(validatedData.leaveTime);
    }
    if (validatedData.engagementScore !== undefined) {
      updateData.engagementScore = validatedData.engagementScore;
    }

    const updatedAttendance = await prisma.attendanceRecord.update({
      where: { id: attendanceId },
      data: updateData,
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
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        attendance: updatedAttendance,
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

export const getSessionAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId } = req.params;

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where: { sessionId },
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
      },
      orderBy: {
        Student: {
          User: {
            name: 'asc',
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      results: attendance.length,
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAttendance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: sessionId } = req.params;
    const validatedData = createAttendanceSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    // Verify session exists and get bootcamp info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        Bootcamp: {
          include: {
            Facilitator: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Verify user is the facilitator or admin
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    if (!facilitator && !isAdmin) {
      throw new AppError('Only facilitators and admins can record attendance', 403);
    }

    if (facilitator && session.Bootcamp.facilitatorId !== facilitator.id) {
      throw new AppError('You can only record attendance for your own bootcamp sessions', 403);
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: validatedData.studentId,
        },
      },
    });

    if (existingAttendance) {
      throw new AppError('Attendance already recorded for this student', 400);
    }

    const attendanceData: any = {
      sessionId,
      studentId: validatedData.studentId,
      status: validatedData.status,
    };

    if (validatedData.joinTime) {
      attendanceData.joinTime = new Date(validatedData.joinTime);
    }

    if (validatedData.leaveTime) {
      attendanceData.leaveTime = new Date(validatedData.leaveTime);
    }

    if (validatedData.engagementScore !== undefined) {
      attendanceData.engagementScore = validatedData.engagementScore;
    }

    const attendance = await prisma.attendanceRecord.create({
      data: attendanceData,
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
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        attendance,
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

