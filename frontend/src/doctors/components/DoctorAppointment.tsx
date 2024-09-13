import React from 'react';
import { Card } from '@mui/material';

import { getStatusColors } from '../../shared/utils/getStatusColors';
import { AppointmentBody } from '../../shared/components/AppointmentBody';
import DoctorAppointmentCardActions from './DoctorAppointmentCardActions';
import { IDoctorAppointment } from '../../types';

interface DoctorAppointmentProps {
  appointment: IDoctorAppointment;
  onUpdate: () => Promise<void>;
}

const DoctorAppointment: React.FC<DoctorAppointmentProps> = ({
  appointment,
  onUpdate,
}) => {
  const { status, patientName, patientAge, cause, date, duration, time } =
    appointment;

  const { background, color } = getStatusColors(status);

  return (
    <Card
      variant="outlined"
      sx={{ p: 2, mb: 2, backgroundColor: background, color }}
    >
      <AppointmentBody
        {...{
          status,
          name: `${patientName}, age ${patientAge}`,
          cause,
          date,
          duration,
          time,
        }}
      />
      <DoctorAppointmentCardActions
        appointmentId={appointment.id}
        status={status}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

export default DoctorAppointment;
