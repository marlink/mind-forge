import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Knowledge Streams API', () => {
  const app = createTestApp();
  let facilitatorToken: string;
  let facilitatorId: string;
  let studentId: string;
  let studentToken: string;
  let knowledgeStreamId: string;

  beforeAll(async () => {
    // Create a facilitator for testing
    const passwordHash = await bcrypt.hash('password123', 12);
    const facilitatorUser = await prisma.user.create({
      data: {
        email: 'stream.facilitator@test.com',
        name: 'Stream Facilitator',
        passwordHash,
        role: 'FACILITATOR',
        Facilitator: {
          create: {
            specialties: ['Test'],
            bio: 'Test facilitator',
            rating: 0,
            availability: {},
          },
        },
      },
      include: { Facilitator: true },
    });

    facilitatorId = facilitatorUser.Facilitator!.id;

    // Login as facilitator
    const facilitatorLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stream.facilitator@test.com',
        password: 'password123',
      });

    facilitatorToken = facilitatorLogin.body.data.token;

    // Create a knowledge stream for testing
    const knowledgeStream = await prisma.knowledgeStream.create({
      data: {
        name: 'Logic & Reasoning',
        description: 'Learn logical thinking and reasoning',
        color: '#3B82F6',
        icon: 'brain',
        levels: {
          create: [
            {
              level: 1,
              title: 'Introduction to Logic',
              skills: ['Basic reasoning', 'Identifying arguments'],
              prerequisites: [],
              estimatedCompletionTime: '2 weeks',
              bootcampIds: [],
            },
          ],
        },
      },
    });

    knowledgeStreamId = knowledgeStream.id;

    // Create a student for testing
    const studentUser = await prisma.user.create({
      data: {
        email: 'stream.student@test.com',
        name: 'Stream Student',
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

    studentId = studentUser.Student!.id;

    // Login as student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'stream.student@test.com',
        password: 'password123',
      });

    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.studentKnowledgeStream.deleteMany({
      where: {
        studentId: studentId,
      },
    });
    await prisma.knowledgeStream.deleteMany({
      where: {
        id: knowledgeStreamId,
      },
    });
    await prisma.student.deleteMany({
      where: {
        userId: {
          in: await prisma.user.findMany({
            where: { email: { contains: '@test.com' } },
            select: { id: true },
          }).then(users => users.map(u => u.id)),
        },
      },
    });
    await prisma.facilitator.deleteMany({
      where: {
        userId: {
          in: await prisma.user.findMany({
            where: { email: { contains: '@test.com' } },
            select: { id: true },
          }).then(users => users.map(u => u.id)),
        },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: '@test.com' } },
    });
    await prisma.$disconnect();
  });

  describe('GET /api/knowledge-streams', () => {
    it('should get all knowledge streams', async () => {
      const response = await request(app)
        .get('/api/knowledge-streams')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.knowledgeStreams).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/knowledge-streams/:id', () => {
    it('should get a knowledge stream by id', async () => {
      const response = await request(app)
        .get(`/api/knowledge-streams/${knowledgeStreamId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.knowledgeStream.id).toBe(knowledgeStreamId);
      expect(response.body.data.knowledgeStream).toHaveProperty('levels');
    });

    it('should return 404 for non-existent knowledge stream', async () => {
      const response = await request(app)
        .get('/api/knowledge-streams/non-existent-id')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/students/:studentId/knowledge-streams', () => {
    it('should assign a knowledge stream to a student', async () => {
      const response = await request(app)
        .post(`/api/students/${studentId}/knowledge-streams`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          knowledgeStreamId: knowledgeStreamId,
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.assignment.studentId).toBe(studentId);
      expect(response.body.data.assignment.knowledgeStreamId).toBe(knowledgeStreamId);
    });

    it('should reject assignment without authentication', async () => {
      const response = await request(app)
        .post(`/api/students/${studentId}/knowledge-streams`)
        .send({
          knowledgeStreamId: knowledgeStreamId,
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject assignment by non-facilitator', async () => {
      const response = await request(app)
        .post(`/api/students/${studentId}/knowledge-streams`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          knowledgeStreamId: knowledgeStreamId,
        })
        .expect(403);

      expect(response.body.status).toBe('fail');
    });

    it('should reject duplicate assignment', async () => {
      const response = await request(app)
        .post(`/api/students/${studentId}/knowledge-streams`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          knowledgeStreamId: knowledgeStreamId,
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('already assigned');
    });

    it('should reject assignment to non-existent student', async () => {
      const response = await request(app)
        .post('/api/students/non-existent-id/knowledge-streams')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          knowledgeStreamId: knowledgeStreamId,
        })
        .expect(404);

      expect(response.body.status).toBe('fail');
    });

    it('should reject assignment of non-existent knowledge stream', async () => {
      const response = await request(app)
        .post(`/api/students/${studentId}/knowledge-streams`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          knowledgeStreamId: 'non-existent-id',
        })
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /api/students/:studentId/knowledge-streams', () => {
    it('should get knowledge streams for a student', async () => {
      const response = await request(app)
        .get(`/api/students/${studentId}/knowledge-streams`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.knowledgeStreams).toBeInstanceOf(Array);
      expect(response.body.data.knowledgeStreams.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/non-existent-id/knowledge-streams')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });
});

