import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/doctor';
import Cause from '../models/cause';
import Appointment from '../models/appointment';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const INIT_MARKER = 'init_marker';

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

const createIndexes = async () => {
  try {
    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const marker = await db
      .collection(INIT_MARKER)
      .findOne({ type: 'indexes' });

    if (marker) {
      console.log('Indexes already created, skipping initialization');
    } else {
      // Create indexes for Appointment schema (on doctorId and patientId)
      await Appointment.collection.createIndex({ doctorId: 1 });
      await Appointment.collection.createIndex({ patientId: 1 });
      console.log('Indexes created for Appointment schema');

      // Create index for Cause schema (on specialtyId)s
      await Cause.collection.createIndex({ specialtyId: 1 });
      console.log('Indexes created for Cause schema');

      // Create indexes for Doctor schema (on location, specialtyId, and causes)
      await Doctor.collection.createIndex({ location: '2dsphere' });
      await Doctor.collection.createIndex({ specialtyId: 1 });
      await Doctor.collection.createIndex({ causes: 1 });
      console.log('Indexes created for Doctor schema');

      await db
        .collection(INIT_MARKER)
        .insertOne({ type: 'indexes', createdAt: new Date() });
      console.log('Initialization marker created');
    }

    await mongoose.connection.close();
    console.log('Connection to MongoDB closed');
  } catch (err) {
    console.error('Error creating indexes:', err);
    process.exit(1);
  }
};

createIndexes();
