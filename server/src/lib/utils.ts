import { AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Handle database connection errors consistently
 */
export function handleDatabaseError(error: any): never {
  if (error.code === 'P1001' || error.message?.includes('Can\'t reach database server')) {
    throw new AppError(
      'Database connection failed. Please ensure PostgreSQL is running. Run: docker-compose up -d postgres',
      503
    );
  }
  throw error;
}

/**
 * Check if user is facilitator or admin
 */
export async function verifyFacilitatorOrAdmin(userId: string) {
  try {
    const facilitator = await prisma.facilitator.findUnique({
      where: { userId },
    });

    const isAdmin = await prisma.admin.findUnique({
      where: { userId },
    });

    return { facilitator, isAdmin, hasAccess: !!facilitator || !!isAdmin };
  } catch (error) {
    handleDatabaseError(error);
  }
}

/**
 * Verify user owns bootcamp (for facilitators) or is admin
 */
export async function verifyBootcampOwnership(
  userId: string,
  bootcampId: string
) {
  const { facilitator, isAdmin } = await verifyFacilitatorOrAdmin(userId);

  if (!facilitator && !isAdmin) {
    throw new AppError('Only facilitators and admins can perform this action', 403);
  }

  if (facilitator) {
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: bootcampId },
    });

    if (!bootcamp) {
      throw new AppError('Bootcamp not found', 404);
    }

    if (bootcamp.facilitatorId !== facilitator.id) {
      throw new AppError('You can only manage your own bootcamps', 403);
    }
  }

  return { facilitator, isAdmin };
}

/**
 * Parse pagination query parameters
 */
export function parsePagination(req: { query: any }) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  dataKey: string = 'results'
) {
  const totalPages = Math.ceil(total / limit);
  return {
    status: 'success',
    results: data.length,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    data: {
      [dataKey]: data,
    },
  };
}

/**
 * Require authentication
 */
export function requireAuth(req: AuthRequest): string {
  if (!req.user?.id) {
    throw new AppError('Authentication required', 401);
  }
  return req.user.id;
}

