import { Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Student: {
          include: {
            enrollments: {
              include: {
                Bootcamp: true,
              },
            },
            knowledgeStreams: {
              include: {
                KnowledgeStream: true,
              },
            },
          },
        },
        Parent: {
          include: {
            children: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                enrollments: {
                  include: {
                    Bootcamp: true,
                  },
                },
              },
            },
          },
        },
        Facilitator: {
          include: {
            bootcampsLed: true,
          },
        },
        Admin: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          ...(user.Student && { student: user.Student }),
          ...(user.Parent && { parent: user.Parent }),
          ...(user.Facilitator && { facilitator: user.Facilitator }),
          ...(user.Admin && { admin: user.Admin }),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Authentication required', 401);
    }

    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { role, isActive } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

