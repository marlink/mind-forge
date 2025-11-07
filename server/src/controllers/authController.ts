import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'PARENT', 'FACILITATOR', 'ADMIN']),
  // Student-specific fields
  age: z.number().optional(),
  grade: z.string().optional(),
  interests: z.array(z.string()).optional(),
  learningStyle: z.string().optional(),
  // Parent-specific fields
  subscriptionStatus: z.string().optional(),
  // Facilitator-specific fields
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  // Admin-specific fields
  permissions: z.array(z.string()).optional(),
  department: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  
  return jwt.sign(
    { id: userId, email, role },
    secret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { email, password, name, role, ...roleSpecificData } = validatedData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and role-specific record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
        },
      });

      // Create role-specific record
      if (role === 'STUDENT') {
        await tx.student.create({
          data: {
            userId: user.id,
            age: roleSpecificData.age || 0,
            grade: roleSpecificData.grade || '',
            interests: roleSpecificData.interests || [],
            learningStyle: roleSpecificData.learningStyle || '',
            progress: {},
          },
        });
      } else if (role === 'PARENT') {
        await tx.parent.create({
          data: {
            userId: user.id,
            subscriptionStatus: roleSpecificData.subscriptionStatus || 'trial',
            notificationPreferences: {
              email: true,
              sms: false,
              push: false,
            },
          },
        });
      } else if (role === 'FACILITATOR') {
        await tx.facilitator.create({
          data: {
            userId: user.id,
            specialties: roleSpecificData.specialties || [],
            bio: roleSpecificData.bio || '',
            rating: 0.0,
            availability: {
              days: [],
              timeSlots: [],
            },
          },
        });
      } else if (role === 'ADMIN') {
        await tx.admin.create({
          data: {
            userId: user.id,
            permissions: roleSpecificData.permissions || [],
            department: roleSpecificData.department || '',
          },
        });
      }

      return user;
    });

    // Generate token
    const token = generateToken(result.id, result.email, result.role);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
        },
        token,
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

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user with role-specific data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Student: true,
        Parent: true,
        Facilitator: true,
        Admin: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
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
        Student: true,
        Parent: true,
        Facilitator: true,
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
          // Include role-specific data
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

