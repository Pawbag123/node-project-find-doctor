import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../app';
import Cause from '../models/cause';
import Specialty from '../models/specialty';
import Patient from '../models/patient';
import Doctor from '../models/doctor';
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
  await Cause.deleteMany({});
  await Specialty.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({});
  await User.deleteMany({});
});

describe('Users API', () => {
  it('should create a new patient user', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      password: 'password',
      age: 30,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('role', 'patient');
    expect(res.body).toHaveProperty('token');

    const userInDb = await User.findOne({ email: 'johndoe@email.com' });
    const patientInDb = await Patient.findOne({ name: 'John Doe' });
    expect(userInDb).not.toBeNull();
    expect(userInDb?.role).toBe('patient');
    expect(userInDb?.patientProfileId).toEqual(patientInDb?._id);
  });

  it('should not create a new user with the same email', async () => {
    const patient1 = new Patient({ name: 'John Doe', age: 35 });
    await patient1.save();
    const user = new User({
      email: 'john@email.com',
      password: 'password',
      role: 'patient',
      patientProfileId: patient1._id,
    });
    await user.save();
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'Jane Doe',
      email: 'john@email.com',
      password: 'password',
      age: 30,
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Email already exists'
    );
  });

  it('should not create a new user with invalid email', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'John Doe',
      email: 'johndoe',
      password: 'password',
      age: 30,
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Invalid email');
  });

  it('should not create a new user with missing email', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'John Doe',
      password: 'password',
      age: 30,
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: email is required');
  });

  it('should not create a new user with password shorter than 8 characters', async () => {
    const res = await request(app).post('/api/users/signup/patient').send({
      name: 'John Doe',
      email: 'johndoe@email.com',
      age: 30,
      password: 'pass',
    });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Password must be at least 8 characters long'
    );
  });

  // it('should create a new doctor user', async () => {
  //   const specialty = new Specialty({ name: 'Dermatology' });
  //   await specialty.save();

  //   const cause = new Cause({ name: 'Acne', specialtyId: specialty._id });
  //   await cause.save();

  //   const res = await request(app)
  //     .post('/api/users/signup/doctor')
  //     .send({
  //       name: 'Jane Doe',
  //       image: 'image.jpg',
  //       email: 'janedoe@email.com',
  //       password: 'password',
  //       specialtyId: specialty._id,
  //       causes: [cause._id],
  //       address: 'warsaw',
  //       availability: {
  //         Monday: ['09:00'],
  //         Tuesday: ['09:00'],
  //         Wednesday: ['09:00'],
  //         Thursday: ['09:00'],
  //         Friday: ['09:00'],
  //         Saturday: ['09:00'],
  //         Sunday: ['09:00'],
  //       },
  //     });

  //   expect(res.status).toBe(201);
  //   expect(res.body).toHaveProperty('userId');
  //   expect(res.body).toHaveProperty('role', 'doctor');
  //   expect(res.body).toHaveProperty('token');

  //   const userInDb = await User.findOne({ email: 'janedoe@email.com' });
  //   const doctorInDb = await Doctor.findOne({ name: 'Jane Doe' });
  //   expect(userInDb).not.toBeNull();
  //   expect(userInDb?.role).toBe('doctor');
  //   expect(userInDb?.doctorProfileId).toEqual(doctorInDb?._id);
  // });

  it('should login a user', async () => {
    const patient = new Patient({ name: 'John Doe', age: 35 });
    await patient.save();

    const hashedPassword = await bcrypt.hash('johndoe@email.com', 12);

    const user = new User({
      email: 'johndoe@email.com',
      password: hashedPassword,
      role: 'patient',
      patientProfileId: patient._id,
    });
    await user.save();

    const res = await request(app).post('/api/users/login').send({
      email: 'johndoe@email.com',
      password: 'johndoe@email.com',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId', user.id);
    expect(res.body).toHaveProperty('role', user.role);
    expect(res.body).toHaveProperty(
      'profileId',
      user.patientProfileId.toString()
    );
  });
});
