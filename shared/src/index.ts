// Re-export Prisma types when available
// For now, export basic types

export type UserRole = 'STUDENT' | 'PARENT' | 'FACILITATOR' | 'ADMIN';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Export types from Prisma client (will be available after db:generate)
export * from './types/index.js';

