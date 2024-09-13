import mongoose from 'mongoose';

import { IDoctorM } from '../types';

const Schema = mongoose.Schema;

const doctorSchema = new Schema<IDoctorM>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  specialtyId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Specialty',
  },
  causes: [{ type: Schema.Types.ObjectId, required: true, ref: 'Cause' }],
  availability: {
    Monday: [{ type: String }],
    Tuesday: [{ type: String }],
    Wednesday: [{ type: String }],
    Thursday: [{ type: String }],
    Friday: [{ type: String }],
    Saturday: [{ type: String }],
    Sunday: [{ type: String }],
  },
  appointments: [
    { type: Schema.Types.ObjectId, required: true, ref: 'Appointment' },
  ],
});

doctorSchema.index({ location: '2dsphere' });

export default mongoose.model('Doctor', doctorSchema);
