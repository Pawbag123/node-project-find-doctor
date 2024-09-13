import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import app from '../app';
import Cause from '../models/cause';
import Specialty from '../models/specialty';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
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
});

describe('Causes API', () => {
  it('should fetch all causes for a specialty', async () => {
    const specialty = await Specialty.create({ name: 'Cardiology' });
    await Cause.create({ name: 'Heart Attack', specialtyId: specialty._id });
    await Cause.create({ name: 'Hypertension', specialtyId: specialty._id });

    const res = await request(app).get(`/api/causes/${specialty._id}`);

    expect(res.status).toBe(200);
    expect(res.body.causes.length).toBe(2);
    expect(res.body.causes[0].name).toBe('Heart Attack');
    expect(res.body.causes[1].name).toBe('Hypertension');
  });

  it('should create a new cause', async () => {
    const specialty = await Specialty.create({ name: 'Pediatrics' });

    const res = await request(app)
      .post('/api/causes')
      .send({ name: 'Asthma', specialtyId: specialty._id });

    expect(res.status).toBe(201);
    expect(res.body.cause.name).toBe('Asthma');

    const causeInDb = await Cause.findOne({
      name: 'Asthma',
      specialtyId: specialty._id,
    });
    expect(causeInDb).not.toBeNull();
  });

  it('should not create a cause with the same name for the same specialty', async () => {
    const specialty = await Specialty.create({ name: 'Dermatology' });
    await Cause.create({ name: 'Eczema', specialtyId: specialty._id });

    const res = await request(app)
      .post('/api/causes')
      .send({ name: 'Eczema', specialtyId: specialty._id });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Cause with this name already exists for the specified specialty.'
    );
  });

  it('should return a validation error if name is missing', async () => {
    const specialty = await Specialty.create({ name: 'Neurology' });

    const res = await request(app)
      .post('/api/causes')
      .send({ specialtyId: specialty._id });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Name is required');
  });

  it('should return a validation error if specialtyId is missing', async () => {
    const res = await request(app)
      .post('/api/causes')
      .send({ name: 'Seizure' });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Specialty ID is required'
    );
  });

  it('should return an error if specialtyId is invalid', async () => {
    const res = await request(app)
      .post('/api/causes')
      .send({ name: 'Seizure', specialtyId: 'invalid-id' });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Invalid inputs passed: Invalid specialtyId');
  });

  it('should return an error if creating cause fails', async () => {
    jest.spyOn(Cause.prototype, 'save').mockImplementationOnce(() => {
      throw new Error();
    });

    const specialty = await Specialty.create({ name: 'Emergency Medicine' });

    const res = await request(app)
      .post('/api/causes')
      .send({ name: 'Accident', specialtyId: specialty._id });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Creating cause failed, please try again.');
  });
});
