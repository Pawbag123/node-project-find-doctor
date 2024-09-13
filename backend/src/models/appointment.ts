import mongoose from 'mongoose';

import { IAppointmentM } from '../types';

const Schema = mongoose.Schema;

const appointmentSchema = new Schema<IAppointmentM>({
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  status: {
    type: String,
    enum: ['approved', 'rescheduled', 'cancelled', 'finished'],
    required: true,
  },
  startDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  causeId: { type: Schema.Types.ObjectId, ref: 'Cause', required: true },
});

export default mongoose.model('Appointment', appointmentSchema);
