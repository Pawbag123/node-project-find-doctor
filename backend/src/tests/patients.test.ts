import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';

import app from '../app';
import Patient from '../models/patient';
import User from '../models/user';

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  await Patient.deleteMany({});
  await User.deleteMany({});
});

describe('Users API', () => {
  it('should not create patient user without name', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      email: 'johndoe@email.com',
      password: 'password',
      age: 30,
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Name is required');
  });

  it('should not create patient user without age', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'password',
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Age is required');
  });

  it('should not create patient user with invalid name', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'Jo123',
      email: 'johndoe@email.com',
      password: 'password',
      age: 30,
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Name must contain only letters and spaces'
    );
  });

  it('should not create patient user with invalid age', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'password',
      age: 8,
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Age must be a valid value. Minimum age is 18'
    );
  });
});
