import PatientAppointment from './PatientAppointment';
import { IPatientAppointment, AppointmentStatus } from '../../types';

// enum AppointmentStatus {
//   Approved = 'approved',
//   Rescheduled = 'rescheduled',
//   Cancelled = 'cancelled',
//   Finished = 'finished',
// }

// interface IPatientAppointment {
//   id: string;
//   status: AppointmentStatus;
//   address: string;
//   doctorName: string;
//   cause?: string;
//   date: string;
//   duration: string;
//   time: string;
// }

const PatientAppointmentList = ({
  appointments,
  onUpdate,
}: {
  appointments: IPatientAppointment[];
  onUpdate: () => Promise<void>;
}) => {
  return (
    <ul>
      <li>
        <h2 style={{ color: 'black' }}>Upcoming</h2>
        {appointments
          .filter(
            (appointment) =>
              appointment.status === AppointmentStatus.Rescheduled ||
              appointment.status === AppointmentStatus.Approved
          )
          .map((appointment) => (
            <PatientAppointment
              key={appointment.id}
              appointment={appointment}
              onUpdate={onUpdate}
            />
          ))}
      </li>
      <li>
        <h2 style={{ color: 'black' }}>Finished</h2>
        {appointments
          .filter(
            (appointment) =>
              appointment.status === AppointmentStatus.Cancelled ||
              appointment.status === AppointmentStatus.Finished
          )
          .map((appointment) => (
            <PatientAppointment
              key={appointment.id}
              appointment={appointment}
              onUpdate={onUpdate}
            />
          ))}
      </li>
    </ul>
  );
};

export default PatientAppointmentList;
