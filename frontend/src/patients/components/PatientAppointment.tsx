import { Card } from '@mui/material';

import { getStatusColors } from '../../shared/utils/getStatusColors';
import { AppointmentBody } from '../../shared/components/AppointmentBody';
import PatientAppointmentCardActions from './PatientAppointmentCardActions';
import { AppointmentStatus } from '../../types';

interface IPatientAppointment {
  id: string;
  status: AppointmentStatus;
  address: string;
  doctorName: string;
  cause?: string;
  date: string;
  duration: string;
  time: string;
}

const PatientAppointment = ({
  appointment,
  onUpdate,
}: {
  appointment: IPatientAppointment;
  onUpdate: () => Promise<void>;
}) => {
  const { id, status, doctorName, cause, date, duration, time, address } =
    appointment;

  const { background, color } = getStatusColors(status);

  return (
    <Card
      key={id}
      variant="outlined"
      sx={{ p: 2, mb: 2, backgroundColor: background, color }}
    >
      <AppointmentBody
        {...{ status, name: doctorName, cause, date, duration, time, address }}
      />
      <PatientAppointmentCardActions
        status={status}
        appointmentId={id}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

export default PatientAppointment;
