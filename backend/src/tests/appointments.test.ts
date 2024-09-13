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
import Appointment from '../models/appointment';

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
  await Appointment.deleteMany({});
});

describe('Appointments API', () => {
  let doctor: any,
    patient: any,
    cause: any,
    doctorToken: string,
    patientToken: string;

  beforeEach(async () => {
    const specialty = new Specialty({ name: 'Dermatology' });
    await specialty.save();

    cause = new Cause({ name: 'Acne', specialtyId: specialty._id });
    await cause.save();

    doctor = new Doctor({
      name: 'Dr. Smith',
      image: 'image.jpg',
      address: '123 Main St',
      location: { type: 'Point', coordinates: [40.7128, -74.006] },
      specialtyId: specialty._id,
      causes: [cause._id],
      availability: { Monday: ['09:00', '09:30', '10:00', '10:30'] },
      appointments: [],
    });
    await doctor.save();

    patient = new Patient({
      name: 'John Doe',
      age: 30,
      appointments: [],
    });
    await patient.save();

    const patientUser = new User({
      email: 'john@email.com',
      password: await bcrypt.hash('password', 12),
      role: 'patient',
      patientProfileId: patient._id,
    });
    await patientUser.save();

    const user = new User({
      email: 'drsmith@email.com',
      password: await bcrypt.hash('password', 12),
      role: 'doctor',
      doctorProfileId: doctor._id,
    });
    await user.save();

    const loginData = await request(app).post('/api/users/login').send({
      email: 'drsmith@email.com',
      password: 'password',
    });
    doctorToken = loginData.body.token;

    const patientLoginData = await request(app).post('/api/users/login').send({
      email: 'john@email.com',
      password: 'password',
    });
    patientToken = patientLoginData.body.token;
  });

  it('should create an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: '2024-09-16T10:00:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('appointment');
    expect(res.body.appointment).toHaveProperty(
      'doctorId',
      doctor._id.toString()
    );
    expect(res.body.appointment).toHaveProperty(
      'patientId',
      patient._id.toString()
    );
  });

  it('should return 422 if invalid cause is provided for creating an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: '123',
        startDate: '2024-09-16T10:00:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Invalid causeId');
  });

  it('should return 422 if invalid doctorId is provided for creating an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: '123',
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: '2024-09-16T10:00:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Invalid doctorId');
  });

  it('should return 422 if invalid startDate is provided for creating an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: 'adf',
        duration: 30,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Invalid date format');
  });

  it('should return 401 if invalid patient token is provided for creating an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer xys`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: '2024-09-16T10:00:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authentication failed! Invalid token');
  });

  it('should return 422 if invalid duration is provided for creating an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: '2024-09-16T10:00:00.000Z',
        duration: 72432,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Invalid duration');
  });

  it("should return 422 if start date and duration doesn't fit doctor schedule", async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: '2024-09-16T15:00:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Doctor is not available at this time'
    );
  });

  it("should return 422 if start date and duration collide with other doctor's appointments", async () => {
    const appointment = new Appointment({
      doctorId: doctor._id,
      patientId: patient._id,
      causeId: cause._id,
      startDate: '2024-09-16T10:00:00.000Z',
      duration: 30,
      status: 'approved',
    });
    await appointment.save();

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: patient._id.toString(),
        causeId: cause._id.toString(),
        startDate: '2024-09-16T15:00:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Doctor is not available at this time'
    );
  });

  it("should change appointment's status", async () => {
    const appointment = new Appointment({
      doctorId: doctor._id,
      patientId: patient._id,
      causeId: cause._id,
      startDate: '2024-09-16T10:00:00.000Z',
      duration: 30,
      status: 'approved',
    });
    await appointment.save();

    const res = await request(app)
      .patch(`/api/appointments/status/${appointment._id.toString()}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        status: 'cancelled',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('appointment');
    expect(res.body.appointment).toHaveProperty('status', 'cancelled');
  });

  it('should reschedule appointment', async () => {
    const appointment = new Appointment({
      doctorId: doctor._id,
      patientId: patient._id,
      causeId: cause._id,
      startDate: '2024-09-16T10:00:00.000Z',
      duration: 30,
      status: 'approved',
    });
    await appointment.save();

    const res = await request(app)
      .patch(`/api/appointments/doctor/${appointment._id.toString()}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        doctorId: doctor._id,
        patientId: patient._id,
        causeId: cause._id,
        startDate: '2024-09-16T09:30:00.000Z',
        duration: 30,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('appointment');
    expect(res.body.appointment).toHaveProperty('status', 'rescheduled');
    expect(res.body.appointment).toHaveProperty(
      'startDate',
      '2024-09-16T09:30:00.000Z'
    );
  });
});
