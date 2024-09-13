export enum UserRole {
  Doctor = 'doctor',
  Patient = 'patient',
}

export interface defaultAppointmentData {
  cause: string;
  date: string;
  time: string;
  duration: string;
}

export interface IDoctorProfile {
  id: string;
  image: string;
  name: string;
  address: string;
  specialtyId: string;
  causes: string[];
  availability: {
    Monday?: string[];
    Tuesday?: string[];
    Wednesday?: string[];
    Thursday?: string[];
    Friday?: string[];
    Saturday?: string[];
    Sunday?: string[];
  };
}

export interface IDoctorAppointment {
  id: string;
  status: AppointmentStatus;
  address: string;
  patientName: string;
  patientAge: number;
  cause?: string;
  date: string;
  duration: string;
  time: string;
}

export interface IDoctorForAppointment {
  id: string;
  image: string;
  name: string;
  address: string;
  specialty: IObject;
  availability: {
    Monday?: string[];
    Tuesday?: string[];
    Wednesday?: string[];
    Thursday?: string[];
    Friday?: string[];
    Saturday?: string[];
    Sunday?: string[];
  };
  causes: IObject[];
  bookedSlots?: IBookedSlots;
}

export interface IBookedSlots {
  [key: string]: string[];
}

export interface LoginData {
  userId: string;
  token: string;
  role: UserRole;
  profileId: string;
}

export interface HttpError extends Error {
  status: number;
}
export interface IObject {
  id: string;
  name: string;
}
export interface IUserM {
  role: UserRole;
  email: string;
  password: string;
  doctorProfileId?: string;
  patientProfileId?: string;
}

export interface IDoctorListed {
  id: string;
  image: string;
  name: string;
  address: string;
  distance?: number;
  specialty: { id: string; name: string };
  causes: { id: string; name: string }[];
}

export interface IDoctorM {
  image: string;
  name: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  specialtyId: string;
  causes: string[];
  availability: {
    Monday?: string[];
    Tuesday?: string[];
    Wednesday?: string[];
    Thursday?: string[];
    Friday?: string[];
    Saturday?: string[];
    Sunday?: string[];
  };
  appointments: string[];
}

export interface IPatientM {
  name: string;
  age: number;
  appointments: object[];
}
export interface IAppointmentM {
  patientId: string;
  doctorId: string;
  status: AppointmentStatus;
  causeId: string;
  startDate: Date;
  duration: number;
}
export interface ISpecialtyM {
  name: string;
}

export interface ICauseM {
  name: string;
  specialtyId: string;
}

export interface Doctor {
  dId: string;
  image: string;
  name: string;
  specialty: string;
  causes: string[];
  address: string;
  distance?: number;
}

export interface IPatientAppointment {
  id: string;
  status: AppointmentStatus;
  address: string;
  doctorName: string;
  cause?: string;
  date: string;
  duration: string;
  time: string;
}

export enum LoginState {
  NotLoggedIn = 0,
  Doctor = 1,
  Patient = 2,
}

export enum AppointmentStatus {
  Approved = 'approved',
  Rescheduled = 'rescheduled',
  Cancelled = 'cancelled',
  Finished = 'finished',
}

export interface IDoctor {
  dId: string;
  image: string;
  name: string;
  address: string;
  specialty: string;
  causes: string[];
  availability: {
    Monday?: string[];
    Tuesday?: string[];
    Wednesday?: string[];
    Thursday?: string[];
    Friday?: string[];
    Saturday?: string[];
    Sunday?: string[];
  };
  appointments: string[];
}
