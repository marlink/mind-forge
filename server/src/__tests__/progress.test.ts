import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Progress API', () => {
  const app = createTestApp();
  let facilitatorToken: string;
  let facilitatorId: string;
  let bootcampId: string;
  let sessionId: string;
  let studentId: string;
  let studentToken: string;
  let progressId: string;

  beforeAll(async () => {
    // Create a facilitator for testing
    const passwordHash = await bcrypt.hash('password123', 12);
    const facilitatorUser = await prisma.user.create({
      data: {
        email: 'progress.facilitator@test.com',
        name: 'Progress Facilitator',
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
        email: 'progress.facilitator@test.com',
        password: 'password123',
      });

    facilitatorToken = facilitatorLogin.body.data.token;

    // Create a bootcamp for testing
    const bootcamp = await prisma.bootcamp.create({
      data: {
        title: 'Progress Test Bootcamp',
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

    // Create a session for testing
    const session = await prisma.session.create({
      data: {
        bootcampId: bootcampId,
        day: 1,
        theme: 'Introduction',
        date: new Date('2024-01-15T10:00:00Z'),
        startTime: '10:00',
        endTime: '12:00',
      },
    });

    sessionId = session.id;

    // Create a student for testing
    const studentUser = await prisma.user.create({
      data: {
        email: 'progress.student@test.com',
        name: 'Progress Student',
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
        email: 'progress.student@test.com',
        password: 'password123',
      });

    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.progressRecord.deleteMany({
      where: {
        studentId: studentId,
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

  describe('GET /api/students/:studentId/progress', () => {
    it('should get progress for a student', async () => {
      const response = await request(app)
        .get(`/api/students/${studentId}/progress`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.progress).toBeInstanceOf(Array);
    });

    it('should filter progress by skill', async () => {
      // First create a progress record
      const createResponse = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          studentId: studentId,
          bootcampId: bootcampId,
          skill: 'Critical Thinking',
          level: 'Intermediate',
          assessmentDate: new Date().toISOString(),
          evidence: 'Completed argument analysis exercise',
          nextSteps: 'Practice identifying fallacies',
        })
        .expect(201);

      progressId = createResponse.body.data.progress.id;

      const response = await request(app)
        .get(`/api/students/${studentId}/progress?skill=Critical Thinking`)
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.progress.forEach((record: any) => {
        expect(record.skill).toBe('Critical Thinking');
      });
    });

    it('should return 404 for non-existent student', async () => {
      const response = await request(app)
        .get('/api/students/non-existent-id/progress')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/progress', () => {
    it('should create a progress record as facilitator', async () => {
      const progressData = {
        studentId: studentId,
        bootcampId: bootcampId,
        sessionId: sessionId,
        skill: 'Communication',
        level: 'Beginner',
        assessmentDate: new Date().toISOString(),
        evidence: 'Participated in group discussion',
        nextSteps: 'Practice active listening',
      };

      const response = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(progressData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.progress.skill).toBe(progressData.skill);
      expect(response.body.data.progress.level).toBe(progressData.level);
      expect(response.body.data.progress.studentId).toBe(studentId);
    });

    it('should reject progress creation without authentication', async () => {
      const response = await request(app)
        .post('/api/progress')
        .send({
          studentId: studentId,
          skill: 'Test',
          level: 'Beginner',
          assessmentDate: new Date().toISOString(),
          evidence: 'Test',
          nextSteps: 'Test',
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject progress creation by non-facilitator', async () => {
      const response = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studentId: studentId,
          skill: 'Test',
          level: 'Beginner',
          assessmentDate: new Date().toISOString(),
          evidence: 'Test',
          nextSteps: 'Test',
        })
        .expect(403);

      expect(response.body.status).toBe('fail');
    });

    it('should reject progress creation with invalid data', async () => {
      const response = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          studentId: '',
          skill: '',
          level: '',
          assessmentDate: 'invalid-date',
          evidence: '',
          nextSteps: '',
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
    });

    it('should reject progress creation for non-existent student', async () => {
      const response = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          studentId: 'non-existent-id',
          skill: 'Test',
          level: 'Beginner',
          assessmentDate: new Date().toISOString(),
          evidence: 'Test',
          nextSteps: 'Test',
        })
        .expect(404);

      expect(response.body.status).toBe('fail');
    });

    it('should reject progress creation for bootcamp not led by facilitator', async () => {
      // Create another facilitator and bootcamp
      const otherFacilitatorUser = await prisma.user.create({
        data: {
          email: 'other.facilitator@test.com',
          name: 'Other Facilitator',
          passwordHash: await bcrypt.hash('password123', 12),
          role: 'FACILITATOR',
          Facilitator: {
            create: {
              specialties: ['Test'],
              bio: 'Test',
              rating: 0,
              availability: {},
            },
          },
        },
        include: { Facilitator: true },
      });

      const otherBootcamp = await prisma.bootcamp.create({
        data: {
          title: 'Other Bootcamp',
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          facilitatorId: otherFacilitatorUser.Facilitator!.id,
          schedule: 'Mon-Fri',
          capacity: 10,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
          prerequisites: [],
          status: 'PUBLISHED',
          enrollmentCount: 0,
        },
      });

      const response = await request(app)
        .post('/api/progress')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          studentId: studentId,
          bootcampId: otherBootcamp.id,
          skill: 'Test',
          level: 'Beginner',
          assessmentDate: new Date().toISOString(),
          evidence: 'Test',
          nextSteps: 'Test',
        })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('own bootcamps');

      // Cleanup
      await prisma.bootcamp.delete({ where: { id: otherBootcamp.id } });
      await prisma.facilitator.delete({ where: { id: otherFacilitatorUser.Facilitator!.id } });
      await prisma.user.delete({ where: { id: otherFacilitatorUser.id } });
    });
  });

  describe('GET /api/bootcamps/:bootcampId/progress', () => {
    it('should get progress for a bootcamp', async () => {
      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/progress`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.progress).toBeInstanceOf(Array);
    });

    it('should filter progress by skill', async () => {
      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/progress?skill=Critical Thinking`)
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.progress.forEach((record: any) => {
        expect(record.skill).toBe('Critical Thinking');
      });
    });

    it('should return 404 for non-existent bootcamp', async () => {
      const response = await request(app)
        .get('/api/bootcamps/non-existent-id/progress')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('GET /api/rubrics', () => {
    it('should get all rubrics', async () => {
      const response = await request(app)
        .get('/api/rubrics')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.rubrics).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/rubrics/:skill', () => {
    it('should get a rubric by skill', async () => {
      // First ensure a rubric exists
      const existingRubric = await prisma.assessmentRubric.findFirst({
        where: { skill: 'Critical Thinking' },
      });

      if (!existingRubric) {
        await prisma.assessmentRubric.create({
          data: {
            skill: 'Critical Thinking',
            assessmentActivities: ['Test'],
            levels: {
              create: [
                {
                  level: 'Beginner',
                  description: 'Test',
                  criteria: ['Test'],
                },
              ],
            },
          },
        });
      }

      const response = await request(app)
        .get('/api/rubrics/Critical Thinking')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.rubric.skill).toBe('Critical Thinking');
      expect(response.body.data.rubric).toHaveProperty('levels');
    });

    it('should return 404 for non-existent rubric', async () => {
      const response = await request(app)
        .get('/api/rubrics/NonExistentSkill')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });
});

