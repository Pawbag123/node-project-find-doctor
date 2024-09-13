import React from 'react';

import DoctorAppointment from './DoctorAppointment';
import { IDoctorAppointment, AppointmentStatus } from '../../types';

interface DoctorAppointmentListProps {
  appointments: IDoctorAppointment[];
  onUpdate: () => Promise<void>;
}

const DoctorAppointmentList: React.FC<DoctorAppointmentListProps> = ({
  appointments,
  onUpdate,
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
            <DoctorAppointment
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
            <DoctorAppointment
              key={appointment.id}
              appointment={appointment}
              onUpdate={onUpdate}
            />
          ))}
      </li>
    </ul>
  );
};

export default DoctorAppointmentList;
