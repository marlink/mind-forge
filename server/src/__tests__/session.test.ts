import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Session API', () => {
  const app = createTestApp();
  let facilitatorToken: string;
  let facilitatorId: string;
  let bootcampId: string;
  let sessionId: string;
  let studentId: string;
  let studentToken: string;

  beforeAll(async () => {
    // Create a facilitator for testing
    const passwordHash = await bcrypt.hash('password123', 12);
    const facilitatorUser = await prisma.user.create({
      data: {
        email: 'session.facilitator@test.com',
        name: 'Session Facilitator',
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
        email: 'session.facilitator@test.com',
        password: 'password123',
      });

    facilitatorToken = facilitatorLogin.body.data.token;

    // Create a bootcamp for testing
    const bootcamp = await prisma.bootcamp.create({
      data: {
        title: 'Session Test Bootcamp',
        subtitle: 'Test Subtitle',
        description: 'Test description',
        duration: '5 days',
        format: ['ONLINE'],
        ageRange: '12-15',
        subjects: ['Test'],
        facilitatorId: facilitatorId,
        schedule: 'Mon-Fri',
        capacity: 10,
        price: 299,
        learningOutcomes: ['Learn something'],
        weeklySchedule: {},
        prerequisites: [],
        status: 'PUBLISHED',
        enrollmentCount: 0,
      },
    });

    bootcampId = bootcamp.id;

    // Create a student for testing
    const studentUser = await prisma.user.create({
      data: {
        email: 'session.student@test.com',
        name: 'Session Student',
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
        email: 'session.student@test.com',
        password: 'password123',
      });

    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.attendanceRecord.deleteMany({
      where: {
        sessionId: sessionId,
      },
    });
    await prisma.sessionActivity.deleteMany({
      where: {
        sessionId: sessionId,
      },
    });
    await prisma.session.deleteMany({
      where: {
        bootcampId: bootcampId,
      },
    });
    await prisma.bootcamp.deleteMany({
      where: {
        facilitatorId: facilitatorId,
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

  describe('GET /api/bootcamps/:bootcampId/sessions', () => {
    it('should get all sessions for a bootcamp', async () => {
      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/sessions`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.sessions).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent bootcamp', async () => {
      const response = await request(app)
        .get('/api/bootcamps/non-existent-id/sessions')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/bootcamps/:bootcampId/sessions', () => {
    it('should create a session as facilitator', async () => {
      const sessionData = {
        day: 1,
        theme: 'Introduction to Logic',
        date: new Date('2024-01-15T10:00:00Z').toISOString(),
        startTime: '10:00',
        endTime: '12:00',
      };

      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/sessions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.session.day).toBe(sessionData.day);
      expect(response.body.data.session.theme).toBe(sessionData.theme);
      expect(response.body.data.session.bootcampId).toBe(bootcampId);

      sessionId = response.body.data.session.id;
    });

    it('should reject session creation without authentication', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/sessions`)
        .send({
          day: 2,
          theme: 'Test',
          date: new Date().toISOString(),
          startTime: '10:00',
          endTime: '12:00',
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject duplicate session for same day', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/sessions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 1, // Same day as first session
          theme: 'Duplicate',
          date: new Date().toISOString(),
          startTime: '10:00',
          endTime: '12:00',
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('already exists');
    });

    it('should reject session creation with invalid data', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/sessions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: -1, // Invalid: negative day
          theme: '',
          date: 'invalid-date',
          startTime: '',
          endTime: '',
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should get a session by id', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.session.id).toBe(sessionId);
      expect(response.body.data.session).toHaveProperty('activities');
      expect(response.body.data.session).toHaveProperty('Bootcamp');
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/sessions/non-existent-id')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('PUT /api/sessions/:id', () => {
    it('should update a session as facilitator', async () => {
      const updateData = {
        theme: 'Updated Theme',
        startTime: '11:00',
      };

      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.session.theme).toBe(updateData.theme);
      expect(response.body.data.session.startTime).toBe(updateData.startTime);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .send({ theme: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject update by non-facilitator', async () => {
      const response = await request(app)
        .put(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ theme: 'Student Update' })
        .expect(403);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/sessions/:id/activities', () => {
    it('should add an activity to a session', async () => {
      const activityData = {
        time: '10:00',
        type: 'Lecture',
        title: 'Introduction to Logic',
        description: 'Learn the basics of logical thinking',
        materials: ['Slides', 'Handout'],
        learningObjectives: ['Understand basic logic', 'Apply logical reasoning'],
        facilitatorNotes: 'Focus on examples',
        studentDeliverables: ['Complete worksheet'],
      };

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/activities`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(activityData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.activity.title).toBe(activityData.title);
      expect(response.body.data.activity.sessionId).toBe(sessionId);
    });

    it('should reject activity creation without authentication', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/activities`)
        .send({
          time: '10:00',
          type: 'Test',
          title: 'Test Activity',
          description: 'Test',
          materials: [],
          learningObjectives: [],
          studentDeliverables: [],
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject activity creation with invalid data', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/activities`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          time: '',
          type: '',
          title: '',
          description: '',
          materials: [],
          learningObjectives: [],
          studentDeliverables: [],
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /api/sessions/:id/attendance', () => {
    it('should get attendance for a session', async () => {
      const response = await request(app)
        .get(`/api/sessions/${sessionId}/attendance`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.attendance).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get('/api/sessions/non-existent-id/attendance')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/sessions/:id/attendance', () => {
    it('should create attendance record', async () => {
      const attendanceData = {
        studentId: studentId,
        status: 'PRESENT',
        joinTime: new Date('2024-01-15T10:00:00Z').toISOString(),
        engagementScore: 85,
      };

      const response = await request(app)
        .post(`/api/sessions/${sessionId}/attendance`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(attendanceData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.attendance.status).toBe(attendanceData.status);
      expect(response.body.data.attendance.studentId).toBe(studentId);
      expect(response.body.data.attendance.sessionId).toBe(sessionId);
    });

    it('should reject duplicate attendance record', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/attendance`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          studentId: studentId,
          status: 'PRESENT',
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('already recorded');
    });

    it('should reject attendance creation without authentication', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/attendance`)
        .send({
          studentId: studentId,
          status: 'PRESENT',
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject attendance creation with invalid student', async () => {
      const response = await request(app)
        .post(`/api/sessions/${sessionId}/attendance`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          studentId: 'non-existent-id',
          status: 'PRESENT',
        })
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should delete a session as facilitator', async () => {
      // Create a session to delete
      const createResponse = await request(app)
        .post(`/api/bootcamps/${bootcampId}/sessions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 2,
          theme: 'Session to Delete',
          date: new Date('2024-01-16T10:00:00Z').toISOString(),
          startTime: '10:00',
          endTime: '12:00',
        })
        .expect(201);

      const deleteSessionId = createResponse.body.data.session.id;

      const response = await request(app)
        .delete(`/api/sessions/${deleteSessionId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject deletion by non-facilitator', async () => {
      const response = await request(app)
        .delete(`/api/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
    });
  });
});

