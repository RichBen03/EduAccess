import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import School from '../models/School.js';
import Resource from '../models/Resource.js';

let testSchool;
let adminUser;
let teacherUser;
let studentUser;
let adminToken;
let teacherToken;
let studentToken;

describe('Resources API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    
    // Clean up
    await Resource.deleteMany({});
    await User.deleteMany({});
    await School.deleteMany({});
    
    // Create test school
    testSchool = await School.create({
      name: 'Test University',
      code: 'TEST001',
      address: { city: 'Test City', state: 'Test State' }
    });
    
    // Create test users
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      school: testSchool._id
    });
    
    teacherUser = await User.create({
      email: 'teacher@test.com',
      password: 'password123',
      firstName: 'Teacher',
      lastName: 'User',
      role: 'teacher',
      school: testSchool._id
    });
    
    studentUser = await User.create({
      email: 'student@test.com',
      password: 'password123',
      firstName: 'Student',
      lastName: 'User',
      role: 'student',
      school: testSchool._id
    });
    
    // Get tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.data.accessToken;
    
    const teacherLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teacher@test.com', password: 'password123' });
    teacherToken = teacherLogin.body.data.accessToken;
    
    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/resources', () => {
    it('should upload resource successfully as teacher', async () => {
      const resourceData = {
        title: 'Test Resource',
        description: 'This is a test resource',
        subject: 'Mathematics',
        grade: 'Grade 10',
        tags: 'math,algebra,test'
      };

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${teacherToken}`)
        .field('title', resourceData.title)
        .field('description', resourceData.description)
        .field('subject', resourceData.subject)
        .field('grade', resourceData.grade)
        .field('tags', resourceData.tags)
        .attach('file', Buffer.from('test file content'), 'test.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource.title).toBe(resourceData.title);
      expect(response.body.data.resource.status).toBe('pending');
    });

    it('should not upload resource as student', async () => {
      const resourceData = {
        title: 'Student Resource',
        description: 'This should fail',
        subject: 'Science',
        grade: 'Grade 9'
      };

      await request(app)
        .post('/api/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('title', resourceData.title)
        .field('description', resourceData.description)
        .field('subject', resourceData.subject)
        .field('grade', resourceData.grade)
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .expect(403);
    });
  });

  describe('GET /api/resources', () => {
    it('should get resources without authentication', async () => {
      const response = await request(app)
        .get('/api/resources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.resources)).toBe(true);
    });

    it('should filter resources by subject', async () => {
      const response = await request(app)
        .get('/api/resources?subject=Mathematics')
        .expect(200);

      expect(response.body.success).toBe(true);
      // All returned resources should have Mathematics as subject
      response.body.data.resources.forEach(resource => {
        expect(resource.subject).toBe('Mathematics');
      });
    });
  });

  describe('GET /api/resources/:id', () => {
    it('should get resource by ID', async () => {
      // First create a resource
      const resource = await Resource.create({
        title: 'Test Resource for GET',
        description: 'Test description',
        subject: 'Science',
        grade: 'Grade 11',
        uploader: teacherUser._id,
        school: testSchool._id,
        status: 'approved',
        file: {
          originalName: 'test.pdf',
          storedName: 'test-123.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          key: 'test-key'
        }
      });

      const response = await request(app)
        .get(`/api/resources/${resource._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.resource.title).toBe(resource.title);
    });

    it('should not get pending resource as non-admin', async () => {
      const pendingResource = await Resource.create({
        title: 'Pending Resource',
        description: 'Pending description',
        subject: 'English',
        grade: 'Grade 12',
        uploader: teacherUser._id,
        school: testSchool._id,
        status: 'pending',
        file: {
          originalName: 'pending.pdf',
          storedName: 'pending-123.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          key: 'pending-key'
        }
      });

      await request(app)
        .get(`/api/resources/${pendingResource._id}`)
        .expect(404);
    });
  });
});