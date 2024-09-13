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

describe('Doctors API', () => {
  it('should get a doctor by ID', async () => {
    const specialty = new Specialty({ name: 'Cardiology' });
    await specialty.save();

    const cause = new Cause({
      name: 'Heart Attack',
      specialtyId: specialty._id,
    });
    await cause.save();

    const loginData = await request(app)
      .post('/api/users/signup/doctor')
      .send({
        name: 'Dr. John Doe',
        email: 'johndoe@email.com',
        image: 'image.jpg',
        password: 'password',
        address: '123 Main St, Chicago, IL',
        specialtyId: specialty._id.toString(),
        causes: [cause._id.toString()],
        availability: {
          Monday: ['09:00', '09:30', '10:00', '10:30'],
          Tuesday: ['09:00', '09:30', '10:00', '10:30'],
        },
      });
    const token = loginData.body.token;

    const res = await request(app)
      .get(`/api/doctors/${loginData.body.profileId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('doctor');
    expect(res.body.doctor).toHaveProperty('location');
    expect(res.body.doctor).toHaveProperty('address');
    expect(res.body.doctor.name).toBe('Dr. John Doe');
    expect(res.body.doctor.specialtyId).toBe(specialty._id.toString());
    expect(res.body.doctor.causes[0]).toBe(cause._id.toString());
  });

  it('should update a doctor', async () => {
    const specialty = new Specialty({ name: 'Dermatology' });
    await specialty.save();

    const cause = new Cause({ name: 'Acne', specialtyId: specialty._id });
    await cause.save();

    const doctor = new Doctor({
      name: 'Dr. Smith',
      image: 'image.jpg',
      address: '123 Main St',
      location: { type: 'Point', coordinates: [40.7128, -74.006] },
      specialtyId: specialty._id,
      causes: [cause._id],
      availability: { Monday: ['09:00'] },
      appointments: [],
    });
    await doctor.save();

    const hashedPassword = await bcrypt.hash('password', 12);

    const user = new User({
      email: 'drsmith@email.com',
      password: hashedPassword,
      role: 'doctor',
      doctorProfileId: doctor._id,
    });
    await user.save();

    const loginData = await request(app).post('/api/users/login').send({
      email: 'drsmith@email.com',
      password: 'password',
    });
    const token = loginData.body.token;

    const res = await request(app)
      .patch(`/api/doctors/${doctor._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Dr. John Smith',
        image: 'image.jpg',
        address: '123 Main St',
        specialtyId: specialty._id,
        causes: [cause._id],
        availability: { Monday: ['09:00', '09:30'] },
        appointments: [],
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('doctor');
    expect(res.body.doctor).toHaveProperty('name', 'Dr. John Smith');
    expect(res.body.doctor).toHaveProperty('address', '123 Main St');
  });

  it('should return 422 if invalid data is provided for update', async () => {
    const specialty = new Specialty({ name: 'Dermatology' });
    await specialty.save();

    const cause = new Cause({ name: 'Acne', specialtyId: specialty._id });
    await cause.save();

    const doctor = new Doctor({
      name: 'Dr. John Smith',
      image: 'image.jpg',
      address: '123 Main St',
      location: { type: 'Point', coordinates: [40.7128, -74.006] },
      specialtyId: specialty._id,
      causes: [cause._id],
      availability: { Monday: ['09:00'] },
      appointments: [],
    });
    await doctor.save();

    const hashedPassword = await bcrypt.hash('password', 12);

    const user = new User({
      email: 'drsmith@email.com',
      password: hashedPassword,
      role: 'doctor',
      doctorProfileId: doctor._id,
    });
    await user.save();

    const loginData = await request(app).post('/api/users/login').send({
      email: 'drsmith@email.com',
      password: 'password',
    });
    const token = loginData.body.token;

    const res = await request(app)
      .patch(`/api/doctors/${doctor._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        address: '456 Elm St',
      });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Image is required');
  });
});
