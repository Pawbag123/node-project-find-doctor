import React, { useContext, useEffect, useState } from 'react';

import PatientAppointmentList from '../components/PatientAppointmentList';
import PatientAppointmentsHeader from '../components/PatientAppointmentsHeader';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
enum AppointmentStatus {
  Approved = 'approved',
  Rescheduled = 'rescheduled',
  Cancelled = 'cancelled',
  Finished = 'finished',
}

interface IPatientAppointment {
  id: string;
  status: AppointmentStatus;
  address: string;
  doctorName: string;
  cause: string;
  date: string;
  duration: string;
  time: string;
}

const PatientProfile = () => {
  const [loadedAppointments, setLoadedAppointments] = useState<
    IPatientAppointment[]
  >([]);
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, sendRequest } = useHttpClient();
  const { token, profileId } = useContext(AuthContext);

  const fetchAppointments = async () => {
    try {
      const responseData = await sendRequest(
        `http://${window.location.hostname}:5000/api/appointments/patient/${profileId}`,
        'GET',
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setLoadedAppointments(
        responseData.appointments.map((appointment: any) => ({
          id: appointment.id,
          status: appointment.status,
          address: appointment.doctorId.address,
          doctorName: appointment.doctorId.name,
          cause: appointment.causeId.name,
          date: new Date(appointment.startDate).toISOString().split('T')[0],
          time: new Date(appointment.startDate)
            .toISOString()
            .split('T')[1]
            .substring(0, 5),
          duration: appointment.duration,
        }))
      );
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
    fetchAppointments();
  }, [sendRequest, token, profileId]);

  return (
    <React.Fragment>
      <PatientAppointmentsHeader />
      {isLoading && <LoadingSpinner />}
      {!isLoading && loadedAppointments && (
        <PatientAppointmentList
          appointments={loadedAppointments}
          onUpdate={fetchAppointments}
        />
      )}
    </React.Fragment>
  );
};

export default PatientProfile;
