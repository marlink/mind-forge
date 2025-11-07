import request from 'supertest';
import { createTestApp } from './setup.js';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

describe('Communication API', () => {
  const app = createTestApp();
  let senderToken: string;
  let senderId: string;
  let recipientToken: string;
  let recipientId: string;
  let recipientUserId: string;
  let communicationId: string;

  beforeAll(async () => {
    // Create a sender (facilitator) for testing
    const passwordHash = await bcrypt.hash('password123', 12);
    const senderUser = await prisma.user.create({
      data: {
        email: 'comm.sender@test.com',
        name: 'Communication Sender',
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

    senderId = senderUser.id;

    // Login as sender
    const senderLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'comm.sender@test.com',
        password: 'password123',
      });

    senderToken = senderLogin.body.data.token;

    // Create a recipient (student) for testing
    const recipientUser = await prisma.user.create({
      data: {
        email: 'comm.recipient@test.com',
        name: 'Communication Recipient',
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

    recipientId = recipientUser.Student!.id;
    recipientUserId = recipientUser.id;

    // Login as recipient
    const recipientLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'comm.recipient@test.com',
        password: 'password123',
      });

    recipientToken = recipientLogin.body.data.token;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.readReceipt.deleteMany({
      where: {
        communicationId: communicationId,
      },
    });
    await prisma.communicationRecipient.deleteMany({
      where: {
        communicationId: communicationId,
      },
    });
    await prisma.communication.deleteMany({
      where: {
        senderId: senderId,
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

  describe('POST /api/communications', () => {
    it('should create a draft communication', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'Test Message',
          content: 'This is a test message',
          status: 'DRAFT',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.communication).toBeDefined();
      expect(response.body.data.communication.type).toBe('MESSAGE');
      expect(response.body.data.communication.status).toBe('DRAFT');
      expect(response.body.data.communication.recipients).toHaveLength(1);
      communicationId = response.body.data.communication.id;
    });

    it('should create a sent communication', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'EMAIL',
          recipientIds: [recipientUserId],
          subject: 'Test Email',
          content: 'This is a test email',
          status: 'SENT',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.communication.status).toBe('SENT');
      expect(response.body.data.communication.sentAt).toBeDefined();
    });

    it('should create a scheduled communication', async () => {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 1);

      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'ANNOUNCEMENT',
          recipientIds: [recipientUserId],
          subject: 'Scheduled Announcement',
          content: 'This is a scheduled announcement',
          scheduledFor: scheduledFor.toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.data.communication.status).toBe('SCHEDULED');
      expect(response.body.data.communication.scheduledFor).toBeDefined();
    });

    it('should reject invalid recipient IDs', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: ['invalid-uuid'],
          subject: 'Test',
          content: 'Test content',
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-existent recipients', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [fakeId],
          subject: 'Test',
          content: 'Test content',
        });

      expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/communications')
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'Test',
          content: 'Test content',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/communications', () => {
    it('should list communications for authenticated user', async () => {
      const response = await request(app)
        .get('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.communications).toBeDefined();
      expect(Array.isArray(response.body.data.communications)).toBe(true);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/communications?type=EMAIL')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      response.body.data.communications.forEach((comm: any) => {
        expect(comm.type).toBe('EMAIL');
      });
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/communications?status=DRAFT')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      response.body.data.communications.forEach((comm: any) => {
        expect(comm.status).toBe('DRAFT');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/communications?page=1&limit=5')
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should show communications where user is recipient', async () => {
      const response = await request(app)
        .get('/api/communications')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.communications.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/communications/:id', () => {
    it('should get communication details for sender', async () => {
      const response = await request(app)
        .get(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.communication.id).toBe(communicationId);
      expect(response.body.data.communication.Sender).toBeDefined();
      expect(response.body.data.communication.recipients).toBeDefined();
    });

    it('should get communication details for recipient', async () => {
      const response = await request(app)
        .get(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.communication.id).toBe(communicationId);
    });

    it('should reject access for unauthorized users', async () => {
      // Create another user
      const passwordHash = await bcrypt.hash('password123', 12);
      const otherUser = await prisma.user.create({
        data: {
          email: 'comm.other@test.com',
          name: 'Other User',
          passwordHash,
          role: 'STUDENT',
          Student: {
            create: {
              age: 15,
              grade: '9th',
              interests: [],
              learningStyle: 'Auditory',
              progress: {},
            },
          },
        },
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'comm.other@test.com',
          password: 'password123',
        });

      const otherToken = otherLogin.body.data.token;

      const response = await request(app)
        .get(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);

      // Cleanup
      await prisma.student.delete({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should return 404 for non-existent communication', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/communications/${fakeId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/communications/:id', () => {
    it('should update draft communication', async () => {
      const response = await request(app)
        .put(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          subject: 'Updated Subject',
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.communication.subject).toBe('Updated Subject');
      expect(response.body.data.communication.content).toBe('Updated content');
    });

    it('should update status to SENT', async () => {
      const response = await request(app)
        .put(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          status: 'SENT',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.communication.status).toBe('SENT');
      expect(response.body.data.communication.sentAt).toBeDefined();
    });

    it('should reject update from non-sender', async () => {
      const response = await request(app)
        .put(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({
          subject: 'Unauthorized Update',
        });

      expect(response.status).toBe(403);
    });

    it('should reject update of sent communication', async () => {
      // First, create and send a communication
      const sentComm = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'Sent Message',
          content: 'This is sent',
          status: 'SENT',
        });

      const sentCommId = sentComm.body.data.communication.id;

      const response = await request(app)
        .put(`/api/communications/${sentCommId}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          subject: 'Trying to update',
        });

      expect(response.status).toBe(400);

      // Cleanup
      await prisma.communicationRecipient.deleteMany({
        where: { communicationId: sentCommId },
      });
      await prisma.communication.delete({ where: { id: sentCommId } });
    });
  });

  describe('DELETE /api/communications/:id', () => {
    it('should delete communication by sender', async () => {
      // Create a communication to delete
      const commToDelete = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'To Delete',
          content: 'This will be deleted',
        });

      const commId = commToDelete.body.data.communication.id;

      const response = await request(app)
        .delete(`/api/communications/${commId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(204);

      // Verify it's deleted
      const checkResponse = await request(app)
        .get(`/api/communications/${commId}`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(checkResponse.status).toBe(404);
    });

    it('should reject delete from non-sender', async () => {
      const response = await request(app)
        .delete(`/api/communications/${communicationId}`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/communications/:id/read', () => {
    it('should mark communication as read by recipient', async () => {
      // Create a sent communication
      const sentComm = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'Read Test',
          content: 'This will be marked as read',
          status: 'SENT',
        });

      const sentCommId = sentComm.body.data.communication.id;

      const response = await request(app)
        .post(`/api/communications/${sentCommId}/read`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.readReceipt).toBeDefined();
      expect(response.body.data.readReceipt.userId).toBe(recipientUserId);

      // Cleanup
      await prisma.readReceipt.deleteMany({
        where: { communicationId: sentCommId },
      });
      await prisma.communicationRecipient.deleteMany({
        where: { communicationId: sentCommId },
      });
      await prisma.communication.delete({ where: { id: sentCommId } });
    });

    it('should return existing receipt if already read', async () => {
      // Create and mark as read
      const sentComm = await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'Read Test 2',
          content: 'This will be read twice',
          status: 'SENT',
        });

      const sentCommId = sentComm.body.data.communication.id;

      await request(app)
        .post(`/api/communications/${sentCommId}/read`)
        .set('Authorization', `Bearer ${recipientToken}`);

      const response = await request(app)
        .post(`/api/communications/${sentCommId}/read`)
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('already marked as read');

      // Cleanup
      await prisma.readReceipt.deleteMany({
        where: { communicationId: sentCommId },
      });
      await prisma.communicationRecipient.deleteMany({
        where: { communicationId: sentCommId },
      });
      await prisma.communication.delete({ where: { id: sentCommId } });
    });

    it('should reject marking as read by non-recipient', async () => {
      const response = await request(app)
        .post(`/api/communications/${communicationId}/read`)
        .set('Authorization', `Bearer ${senderToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/communications/unread', () => {
    it('should return unread count for recipient', async () => {
      // Create sent communications
      await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'MESSAGE',
          recipientIds: [recipientUserId],
          subject: 'Unread 1',
          content: 'Unread message 1',
          status: 'SENT',
        });

      await request(app)
        .post('/api/communications')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          type: 'NOTIFICATION',
          recipientIds: [recipientUserId],
          subject: 'Unread 2',
          content: 'Unread notification',
          status: 'SENT',
        });

      const response = await request(app)
        .get('/api/communications/unread')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.unreadCount).toBeGreaterThanOrEqual(2);
    });

    it('should filter unread count by type', async () => {
      const response = await request(app)
        .get('/api/communications/unread?type=MESSAGE')
        .set('Authorization', `Bearer ${recipientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });
});

