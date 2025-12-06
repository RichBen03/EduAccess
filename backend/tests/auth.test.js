import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import School from '../models/School.js';

let testSchool;
let adminUser;
let teacherUser;
let studentUser;

// Test data
const testSchoolData = {
  name: 'Test University',
  code: 'TEST001',
  address: {
    city: 'Test City',
    state: 'Test State'
  },
  contact: {
    email: 'contact@test.edu',
    phone: '+1234567890'
  }
};

const adminUserData = {
  email: 'admin@test.com',
  password: 'password123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
};

const teacherUserData = {
  email: 'teacher@test.com',
  password: 'password123',
  firstName: 'Teacher',
  lastName: 'User',
  role: 'teacher'
};

const studentUserData = {
  email: 'student@test.com',
  password: 'password123',
  firstName: 'Student',
  lastName: 'User',
  role: 'student'
};

describe('Authentication API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST);
    
    // Clean up any existing data
    await User.deleteMany({});
    await School.deleteMany({});
    
    // Create test school
    testSchool = await School.create(testSchoolData);
    
    // Create test users
    adminUserData.school = testSchool._id;
    teacherUserData.school = testSchool._id;
    studentUserData.school = testSchool._id;
    
    adminUser = await User.create(adminUserData);
    teacherUser = await User.create(teacherUserData);
    studentUser = await User.create(studentUserData);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'newuser@test.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'student',
        schoolCode: 'TEST001',
        grade: 'Grade 10',
        strand: 'STEM'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.firstName).toBe(newUser.firstName);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const duplicateUser = {
        email: 'admin@test.com', // Already exists
        password: 'password123',
        firstName: 'Duplicate',
        lastName: 'User',
        role: 'student',
        schoolCode: 'TEST001'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with invalid school code', async () => {
      const invalidUser = {
        email: 'invalid@test.com',
        password: 'password123',
        firstName: 'Invalid',
        lastName: 'User',
        role: 'student',
        schoolCode: 'INVALID'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const credentials = {
        email: 'student@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credentials.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      const invalidCredentials = {
        email: 'student@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not login non-existent user', async () => {
      const nonExistentUser = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nonExistentUser)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123'
        });

      const refreshToken = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should not refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', 'refreshToken=invalidtoken')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'student@test.com',
          password: 'password123'
        });

      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('student@test.com');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});