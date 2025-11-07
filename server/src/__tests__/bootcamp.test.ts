import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Bootcamp API', () => {
  const app = createTestApp();
  let facilitatorToken: string;
  let facilitatorId: string;
  let studentToken: string;
  let studentId: string;
  let bootcampId: string;

  beforeAll(async () => {
    // Create a facilitator for testing
    const passwordHash = await bcrypt.hash('password123', 12);
    const facilitatorUser = await prisma.user.create({
      data: {
        email: 'bootcamp.facilitator@test.com',
        name: 'Bootcamp Facilitator',
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
        email: 'bootcamp.facilitator@test.com',
        password: 'password123',
      });

    facilitatorToken = facilitatorLogin.body.data.token;

    // Create a student for testing
    const studentUser = await prisma.user.create({
      data: {
        email: 'bootcamp.student@test.com',
        name: 'Bootcamp Student',
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
        email: 'bootcamp.student@test.com',
        password: 'password123',
      });

    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.enrollment.deleteMany({
      where: {
        studentId: studentId,
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

  describe('GET /api/bootcamps', () => {
    it('should get all published bootcamps', async () => {
      const response = await request(app)
        .get('/api/bootcamps')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
      expect(response.body.data.bootcamps).toBeInstanceOf(Array);
    });

    it('should filter bootcamps by status', async () => {
      const response = await request(app)
        .get('/api/bootcamps?status=DRAFT')
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.bootcamps.forEach((bootcamp: any) => {
        expect(bootcamp.status).toBe('DRAFT');
      });
    });

    it('should filter bootcamps by subject', async () => {
      const response = await request(app)
        .get('/api/bootcamps?subject=Logic')
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.bootcamps.forEach((bootcamp: any) => {
        expect(bootcamp.subjects).toContain('Logic');
      });
    });
  });

  describe('GET /api/bootcamps/:id', () => {
    it('should get a bootcamp by id', async () => {
      // First, create a bootcamp
      const createResponse = await request(app)
        .post('/api/bootcamps')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          title: 'Test Bootcamp',
          subtitle: 'Test Subtitle',
          description: 'Test description',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          schedule: 'Mon-Fri',
          capacity: 10,
          price: 299,
          learningOutcomes: ['Learn something'],
          weeklySchedule: {},
          prerequisites: [],
        })
        .expect(201);

      const createdBootcampId = createResponse.body.data.bootcamp.id;

      // Then get it
      const response = await request(app)
        .get(`/api/bootcamps/${createdBootcampId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.bootcamp.id).toBe(createdBootcampId);
      expect(response.body.data.bootcamp.title).toBe('Test Bootcamp');
    });

    it('should return 404 for non-existent bootcamp', async () => {
      const response = await request(app)
        .get('/api/bootcamps/non-existent-id')
        .expect(404);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/bootcamps', () => {
    it('should create a bootcamp as facilitator', async () => {
      const bootcampData = {
        title: 'New Test Bootcamp',
        subtitle: 'Test Subtitle',
        description: 'Test description for new bootcamp',
        duration: '5 days',
        format: ['ONLINE', 'IN_PERSON'],
        ageRange: '13-16',
        subjects: ['Mathematics', 'Science'],
        schedule: 'Mon-Fri, 9am-3pm',
        capacity: 12,
        price: 399,
        learningOutcomes: [
          'Learn advanced concepts',
          'Apply knowledge practically',
        ],
        weeklySchedule: {
          Monday: { theme: 'Introduction', activities: ['Welcome', 'Overview'] },
        },
        prerequisites: ['Basic knowledge'],
      };

      const response = await request(app)
        .post('/api/bootcamps')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(bootcampData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.bootcamp.title).toBe(bootcampData.title);
      expect(response.body.data.bootcamp.status).toBe('DRAFT');
      expect(response.body.data.bootcamp.facilitatorId).toBe(facilitatorId);

      bootcampId = response.body.data.bootcamp.id;
    });

    it('should reject bootcamp creation without authentication', async () => {
      const response = await request(app)
        .post('/api/bootcamps')
        .send({
          title: 'Unauthorized Bootcamp',
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          schedule: 'Mon-Fri',
          capacity: 10,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject bootcamp creation by non-facilitator', async () => {
      const response = await request(app)
        .post('/api/bootcamps')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Bootcamp',
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          schedule: 'Mon-Fri',
          capacity: 10,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
        })
        .expect(403);

      expect(response.body.status).toBe('fail');
    });

    it('should reject bootcamp creation with invalid data', async () => {
      const response = await request(app)
        .post('/api/bootcamps')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          title: '', // Invalid: empty title
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          schedule: 'Mon-Fri',
          capacity: 10,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/bootcamps/:id/enroll', () => {
    let publishedBootcampId: string;

    beforeAll(async () => {
      // Create a published bootcamp for enrollment tests
      const bootcamp = await prisma.bootcamp.create({
        data: {
          title: 'Enrollment Test Bootcamp',
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          facilitatorId: facilitatorId,
          schedule: 'Mon-Fri',
          capacity: 5,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
          prerequisites: [],
          status: 'PUBLISHED',
          enrollmentCount: 0,
        },
      });

      publishedBootcampId = bootcamp.id;
    });

    it('should enroll student in bootcamp', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${publishedBootcampId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.enrollment).toHaveProperty('id');
      expect(response.body.data.enrollment.status).toBe('ACTIVE');
      expect(response.body.data.enrollment.studentId).toBe(studentId);
      expect(response.body.data.enrollment.bootcampId).toBe(publishedBootcampId);
    });

    it('should reject enrollment without authentication', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${publishedBootcampId}/enroll`)
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    it('should reject duplicate enrollment', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${publishedBootcampId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Already enrolled');
    });

    it('should reject enrollment in non-existent bootcamp', async () => {
      const response = await request(app)
        .post('/api/bootcamps/non-existent-id/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);

      expect(response.body.status).toBe('fail');
    });

    it('should reject enrollment in draft bootcamp', async () => {
      // Create a draft bootcamp
      const draftBootcamp = await prisma.bootcamp.create({
        data: {
          title: 'Draft Bootcamp',
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          facilitatorId: facilitatorId,
          schedule: 'Mon-Fri',
          capacity: 10,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
          prerequisites: [],
          status: 'DRAFT',
          enrollmentCount: 0,
        },
      });

      const response = await request(app)
        .post(`/api/bootcamps/${draftBootcamp.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not available');
    });

    it('should reject enrollment when bootcamp is full', async () => {
      // Create a bootcamp with capacity 1
      const fullBootcamp = await prisma.bootcamp.create({
        data: {
          title: 'Full Bootcamp',
          subtitle: 'Test',
          description: 'Test',
          duration: '5 days',
          format: ['ONLINE'],
          ageRange: '12-15',
          subjects: ['Test'],
          facilitatorId: facilitatorId,
          schedule: 'Mon-Fri',
          capacity: 1,
          price: 299,
          learningOutcomes: ['Learn'],
          weeklySchedule: {},
          prerequisites: [],
          status: 'PUBLISHED',
          enrollmentCount: 1, // Already full
        },
      });

      const response = await request(app)
        .post(`/api/bootcamps/${fullBootcamp.id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('full');
    });
  });
});

