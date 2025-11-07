// Shared TypeScript types
// These will be replaced by Prisma-generated types after running db:generate

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

