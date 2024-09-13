import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import app from '../app';
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
  await Specialty.deleteMany({});
});

describe('Specialty API', () => {
  it('should fetch all specialties', async () => {
    await Specialty.create({ name: 'Cardiology' });
    await Specialty.create({ name: 'Neurology' });

    const res = await request(app).get('/api/specialties');

    expect(res.status).toBe(200);
    expect(res.body.specialties.length).toBe(2);
    expect(res.body.specialties[0].name).toBe('Cardiology');
    expect(res.body.specialties[1].name).toBe('Neurology');
  });

  it('should create a new specialty', async () => {
    const res = await request(app)
      .post('/api/specialties')
      .send({ name: 'Pediatrics' });

    expect(res.status).toBe(201);
    expect(res.body.specialty.name).toBe('Pediatrics');

    const specialtyInDb = await Specialty.findOne({ name: 'Pediatrics' });
    expect(specialtyInDb).not.toBeNull();
  });

  it('should not create a specialty with the same name', async () => {
    await Specialty.create({ name: 'Dermatology' });

    const res = await request(app)
      .post('/api/specialties')
      .send({ name: 'Dermatology' });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Specialty with this name already exists.');
  });

  it('should not create a specialty without the name', async () => {
    const res = await request(app).post('/api/specialties').send({});

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Specialty name is required'
    );
  });

  it('should not create a specialty with an invalid name', async () => {
    const res = await request(app)
      .post('/api/specialties')
      .send({ name: 'Cardiology1 @' });

    expect(res.status).toBe(422);
    expect(res.body.message).toBe(
      'Invalid inputs passed: Specialty name must contain only letters and spaces'
    );
  });

  it('should return an error if creating specialty fails', async () => {
    const mock = jest
      .spyOn(Specialty.prototype, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const res = await request(app)
      .post('/api/specialties')
      .send({ name: 'Emergency Medicine' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe(
      'Creating specialty failed, please try again.'
    );

    mock.mockRestore();
  });
});
