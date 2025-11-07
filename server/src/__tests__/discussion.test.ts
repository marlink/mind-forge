import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Discussion API', () => {
  const app = createTestApp();
  let facilitatorToken: string;
  let facilitatorId: string;
  let bootcampId: string;
  let discussionId: string;
  let studentToken: string;

  beforeAll(async () => {
    // Create a facilitator for testing
    const passwordHash = await bcrypt.hash('password123', 12);
    const facilitatorUser = await prisma.user.create({
      data: {
        email: 'discussion.facilitator@test.com',
        name: 'Discussion Facilitator',
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
        email: 'discussion.facilitator@test.com',
        password: 'password123',
      });

    facilitatorToken = facilitatorLogin.body.data.token;

    // Create a bootcamp for testing
    const bootcamp = await prisma.bootcamp.create({
      data: {
        title: 'Discussion Test Bootcamp',
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
        email: 'discussion.student@test.com',
        name: 'Discussion Student',
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

    // Login as student
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'discussion.student@test.com',
        password: 'password123',
      });

    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.discussionTopic.deleteMany({
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

  describe('GET /api/bootcamps/:bootcampId/discussions', () => {
    it('should list discussions for a bootcamp', async () => {
      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.discussions).toBeDefined();
      expect(Array.isArray(response.body.data.discussions)).toBe(true);
    });

    it('should filter by day', async () => {
      // Create a discussion for day 1
      await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 1,
          title: 'Day 1 Discussion',
          prompt: 'What do you think?',
          guidance: 'Guide students',
          expectedOutcomes: ['Understanding'],
          tags: ['day1'],
        });

      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/discussions?day=1`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      response.body.data.discussions.forEach((discussion: any) => {
        expect(discussion.day).toBe(1);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/discussions?page=1&limit=5`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should return 404 for non-existent bootcamp', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/bootcamps/${fakeId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/bootcamps/${bootcampId}/discussions`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/bootcamps/:bootcampId/discussions', () => {
    it('should create a discussion topic', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 2,
          title: 'Test Discussion',
          prompt: 'What is your opinion?',
          guidance: 'Facilitate discussion',
          expectedOutcomes: ['Critical thinking', 'Communication'],
          tags: ['test', 'discussion'],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.discussion).toBeDefined();
      expect(response.body.data.discussion.day).toBe(2);
      expect(response.body.data.discussion.title).toBe('Test Discussion');
      discussionId = response.body.data.discussion.id;
    });

    it('should reject duplicate day discussions', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 2,
          title: 'Duplicate Day Discussion',
          prompt: 'Another prompt',
          guidance: 'More guidance',
          expectedOutcomes: ['Learning'],
          tags: ['duplicate'],
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: -1, // Invalid day
          title: '',
          prompt: '',
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-facilitator/admin users', async () => {
      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          day: 3,
          title: 'Student Discussion',
          prompt: 'Student prompt',
          guidance: 'Guidance',
          expectedOutcomes: ['Outcome'],
          tags: ['student'],
        });

      expect(response.status).toBe(403);
    });

    it('should reject non-owner facilitators', async () => {
      // Create another facilitator
      const passwordHash = await bcrypt.hash('password123', 12);
      const otherFacilitator = await prisma.user.create({
        data: {
          email: 'other.facilitator@test.com',
          name: 'Other Facilitator',
          passwordHash,
          role: 'FACILITATOR',
          Facilitator: {
            create: {
              specialties: ['Other'],
              bio: 'Other facilitator',
              rating: 0,
              availability: {},
            },
          },
        },
        include: { Facilitator: true },
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other.facilitator@test.com',
          password: 'password123',
        });

      const otherToken = otherLogin.body.data.token;

      const response = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          day: 4,
          title: 'Other Discussion',
          prompt: 'Other prompt',
          guidance: 'Other guidance',
          expectedOutcomes: ['Other'],
          tags: ['other'],
        });

      expect(response.status).toBe(403);

      // Cleanup
      await prisma.facilitator.delete({ where: { userId: otherFacilitator.id } });
      await prisma.user.delete({ where: { id: otherFacilitator.id } });
    });
  });

  describe('GET /api/discussions/:id', () => {
    it('should get discussion details', async () => {
      const response = await request(app)
        .get(`/api/discussions/${discussionId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.discussion.id).toBe(discussionId);
      expect(response.body.data.discussion.Bootcamp).toBeDefined();
    });

    it('should return 404 for non-existent discussion', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/discussions/${fakeId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/discussions/${discussionId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/discussions/:id', () => {
    it('should update discussion topic', async () => {
      const response = await request(app)
        .put(`/api/discussions/${discussionId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          title: 'Updated Discussion Title',
          prompt: 'Updated prompt',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.discussion.title).toBe('Updated Discussion Title');
      expect(response.body.data.discussion.prompt).toBe('Updated prompt');
    });

    it('should update day and check for conflicts', async () => {
      // Create another discussion for day 5
      const day5Discussion = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 5,
          title: 'Day 5 Discussion',
          prompt: 'Day 5 prompt',
          guidance: 'Day 5 guidance',
          expectedOutcomes: ['Outcome'],
          tags: ['day5'],
        });

      const day5Id = day5Discussion.body.data.discussion.id;

      // Try to update discussionId to day 5 (should fail)
      const response = await request(app)
        .put(`/api/discussions/${discussionId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 5,
        });

      expect(response.status).toBe(400);

      // Cleanup
      await prisma.discussionTopic.delete({ where: { id: day5Id } });
    });

    it('should reject update from non-owner', async () => {
      const response = await request(app)
        .put(`/api/discussions/${discussionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Update',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/discussions/:id', () => {
    it('should delete discussion topic', async () => {
      // Create a discussion to delete
      const toDelete = await request(app)
        .post(`/api/bootcamps/${bootcampId}/discussions`)
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send({
          day: 6,
          title: 'To Delete',
          prompt: 'Delete me',
          guidance: 'Guidance',
          expectedOutcomes: ['Delete'],
          tags: ['delete'],
        });

      const deleteId = toDelete.body.data.discussion.id;

      const response = await request(app)
        .delete(`/api/discussions/${deleteId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(response.status).toBe(204);

      // Verify it's deleted
      const checkResponse = await request(app)
        .get(`/api/discussions/${deleteId}`)
        .set('Authorization', `Bearer ${facilitatorToken}`);

      expect(checkResponse.status).toBe(404);
    });

    it('should reject delete from non-owner', async () => {
      const response = await request(app)
        .delete(`/api/discussions/${discussionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });
});

