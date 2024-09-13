import mongoose from 'mongoose';

import { IUserM } from '../types';

const Schema = mongoose.Schema;

const userSchema = new Schema<IUserM>({
  role: { type: String, enum: ['doctor', 'patient'], required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  doctorProfileId: { type: Schema.Types.ObjectId, required: false },
  patientProfileId: { type: Schema.Types.ObjectId, required: false },
});

export default mongoose.model('User', userSchema);
