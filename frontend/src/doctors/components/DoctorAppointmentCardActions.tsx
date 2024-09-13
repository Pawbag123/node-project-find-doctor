// src/patients/components/CardActionsComponent.tsx
import React, { useContext, useEffect, useState } from 'react';
import { CardActions } from '@mui/material';

import { EditButton, CancelButton } from '../../shared/components/UIElements';
import {
  AppointmentStatus,
  defaultAppointmentData,
  IBookedSlots,
  IDoctorForAppointment,
} from '../../types';
import { useSnackbar } from 'notistack';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { mapAppointmentsToTime } from '../../shared/utils/mapDoctorsAppointments';
import EditAppointmentDialog from '../../patients/components/EditAppointmentDialog';

interface DoctorAppointmentCardActionsProps {
  status: AppointmentStatus;
  appointmentId: string;
  onUpdate: () => Promise<void>;
}

interface AppointmentData extends defaultAppointmentData {
  patientId: string;
}

const DoctorAppointmentCardActions: React.FC<
  DoctorAppointmentCardActionsProps
> = ({ status, appointmentId, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { sendRequest } = useHttpClient();
  const { token, profileId } = useContext(AuthContext);
  const [doctor, setDoctor] = useState<IDoctorForAppointment | null>(null);
  const [appointmentData, setAppointmentData] =
    useState<AppointmentData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditDialogOpen = () => {
    setIsEditOpen(true);
  };

  const handleReschedule = async (
    _: string,
    startDate: string,
    duration: number
  ) => {
    try {
      await sendRequest(
        `http://${window.location.hostname}:5000/api/appointments/doctor/${appointmentId}`,
        'PATCH',
        JSON.stringify({
          doctorId: profileId,
          causeId: appointmentData?.cause,
          startDate,
          duration,
          patientId: appointmentData?.patientId,
        }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      );
      onUpdate();
      enqueueSnackbar('Appointment updated', { variant: 'success' });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }
  };

  const handleCancel = async () => {
    try {
      await sendRequest(
        `http://${window.location.hostname}:5000/api/appointments/status/${appointmentId}`,
        'PATCH',
        JSON.stringify({ status: AppointmentStatus.Cancelled }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      );
      onUpdate();
      enqueueSnackbar('Appointment cancelled', { variant: 'success' });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    const getAppointmentWithDoctorData = async () => {
      try {
        const responseData = await sendRequest(
          `http://${window.location.hostname}:5000/api/appointments/edit/${appointmentId}`,
          'GET',
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        let bookedSlots: IBookedSlots = {};
        if (responseData.appointment.doctorId.appointments.length) {
          bookedSlots = mapAppointmentsToTime(
            responseData.appointment.doctorId.appointments
          );
        }
        setDoctor({
          id: responseData.appointment.doctorId.id,
          image: responseData.appointment.doctorId.image,
          name: responseData.appointment.doctorId.name,
          address: responseData.appointment.doctorId.address,
          specialty: {
            id: responseData.appointment.doctorId.specialtyId.id,
            name: responseData.appointment.doctorId.specialtyId.name,
          },
          causes: responseData.appointment.doctorId.causes.map(
            (cause: any) => ({
              id: cause.id,
              name: cause.name,
            })
          ),
          availability: responseData.appointment.doctorId.availability,
          bookedSlots,
        });

        setAppointmentData({
          patientId: responseData.appointment.patientId,
          cause: responseData.appointment.causeId,
          date: new Date(
            responseData.appointment.startDate
          ).toLocaleDateString(),
          time: new Date(responseData.appointment.startDate)
            .toISOString()
            .split('T')[1]
            .substring(0, 5),
          duration: responseData.appointment.duration,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('fetching specialties aborted');
        } else {
          console.error(err);
          enqueueSnackbar(err.message, { variant: 'error' });
        }
      }
    };

    if (isEditOpen && !doctor) {
      getAppointmentWithDoctorData();
    }
  }, [isEditOpen, token, doctor, sendRequest, appointmentId]);

  return (
    <>
      <CardActions sx={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        {status === AppointmentStatus.Approved && (
          <>
            <EditButton text="Reschedule" onClick={handleEditDialogOpen} />
            <CancelButton onClick={handleCancel} />
          </>
        )}
      </CardActions>
      {isEditOpen && doctor && appointmentData && (
        <EditAppointmentDialog
          isDoctor={true}
          appointmentData={appointmentData}
          doctor={doctor}
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={onUpdate}
          handleEdit={handleReschedule}
        />
      )}
    </>
  );
};

export default DoctorAppointmentCardActions;
