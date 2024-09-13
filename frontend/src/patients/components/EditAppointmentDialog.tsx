import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';

import { defaultAppointmentData, IDoctorForAppointment } from '../../types';
import AppointmentForm from '../../shared/components/AppointmentForm';

interface EditAppointmentDialogProps {
  isDoctor?: boolean;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  handleEdit: (
    causeId: string,
    startDate: string,
    duration: number
  ) => Promise<void>;
  appointmentData: defaultAppointmentData;
  doctor: IDoctorForAppointment;
}

const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  isDoctor,
  open,
  onClose,
  onSave,
  handleEdit,
  appointmentData,
  doctor,
}) => {
  const handleSubmit = async () => {
    await onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Appointment</DialogTitle>
      <DialogContent>
        <AppointmentForm
          isDoctor={isDoctor}
          doctor={doctor}
          defaultData={appointmentData}
          handleEdit={async (causeId, startDate, duration) => {
            await handleEdit(causeId, startDate, duration);
            handleSubmit();
          }}
        ></AppointmentForm>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAppointmentDialog;
