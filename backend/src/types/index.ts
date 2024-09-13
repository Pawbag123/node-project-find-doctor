import { Types } from 'mongoose';

export enum AppointmentStatus {
  Approved = 'approved',
  Rescheduled = 'rescheduled',
  Cancelled = 'cancelled',
  Finished = 'finished',
}

export enum UserRole {
  Doctor = 'doctor',
  Patient = 'patient',
}

export interface IUserM {
  role: UserRole;
  email: string;
  password: string;
  doctorProfileId?: Types.ObjectId;
  patientProfileId?: Types.ObjectId;
}
export interface IDoctorM {
  image: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  specialtyId: Types.ObjectId;
  causes: Types.ObjectId[];
  availability: {
    Monday?: string[];
    Tuesday?: string[];
    Wednesday?: string[];
    Thursday?: string[];
    Friday?: string[];
    Saturday?: string[];
    Sunday?: string[];
  };
  appointments: Types.ObjectId[];
}

export interface IPatientM {
  name: string;
  age: number;
  appointments: Types.ObjectId[];
}
export interface IAppointmentM {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  status: AppointmentStatus;
  causeId: Types.ObjectId;
  startDate: Date;
  duration: number;
}
export interface ISpecialtyM {
  name: string;
}

export interface ICauseM {
  name: string;
  specialtyId: Types.ObjectId;
}
