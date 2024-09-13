import mongoose from 'mongoose';

import { ICauseM } from '../types';

const Schema = mongoose.Schema;

const causeSchema = new Schema<ICauseM>({
  name: { type: String, required: true },
  specialtyId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Specialty',
  },
});

export default mongoose.model('Cause', causeSchema);
