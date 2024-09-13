import mongoose from 'mongoose';

import { ISpecialtyM } from '../types';

const Schema = mongoose.Schema;

const specialtySchema = new Schema<ISpecialtyM>({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model('Specialty', specialtySchema);
