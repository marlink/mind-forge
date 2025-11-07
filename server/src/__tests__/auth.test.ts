import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Authentication API', () => {
  const app = createTestApp();

  beforeEach(async () => {
    // Clean up test data if needed
    // Note: In a real test environment, you'd use a test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
      const userData = {
        email: 'test.student@example.com',
        password: 'password123',
        name: 'Test Student',
        role: 'STUDENT',
        age: 14,
        grade: '8th',
        interests: ['Math', 'Science'],
        learningStyle: 'Visual',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('STUDENT');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should register a new parent successfully', async () => {
      const userData = {
        email: 'test.parent@example.com',
        password: 'password123',
        name: 'Test Parent',
        role: 'PARENT',
        subscriptionStatus: 'trial',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.role).toBe('PARENT');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should register a new facilitator successfully', async () => {
      const userData = {
        email: 'test.facilitator@example.com',
        password: 'password123',
        name: 'Test Facilitator',
        role: 'FACILITATOR',
        specialties: ['Math', 'Science'],
        bio: 'Test bio',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.role).toBe('FACILITATOR');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'STUDENT',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject registration with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
        role: 'STUDENT',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'STUDENT',
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      const passwordHash = await bcrypt.hash('password123', 12);
      await prisma.user.create({
        data: {
          email: 'login.test@example.com',
          name: 'Login Test User',
          passwordHash,
          role: 'STUDENT',
          Student: {
            create: {
              age: 14,
              grade: '8th',
              interests: [],
              learningStyle: 'Visual',
              progress: {},
            },
          },
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login.test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'login.test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create a test user and get token
      const passwordHash = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: 'me.test@example.com',
          name: 'Me Test User',
          passwordHash,
          role: 'STUDENT',
          Student: {
            create: {
              age: 14,
              grade: '8th',
              interests: [],
              learningStyle: 'Visual',
              progress: {},
            },
          },
        },
        include: { Student: true },
      });

      userId = user.id;

      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'me.test@example.com',
          password: 'password123',
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.id).toBe(userId);
      expect(response.body.data.user.email).toBe('me.test@example.com');
      expect(response.body.data.user).toHaveProperty('student');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.status).toBe('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });
});

