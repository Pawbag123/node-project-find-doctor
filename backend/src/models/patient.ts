import mongoose from 'mongoose';

import { IPatientM } from '../types';

const Schema = mongoose.Schema;

const patientSchema = new Schema<IPatientM>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
});

export default mongoose.model('Patient', patientSchema);
