import { useContext, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import DoctorAppointmentList from '../components/DoctorAppointmentList';
import DoctorAppointmentsHeader from '../components/DoctorAppointmentsHeader';
import './DoctorProfile.css';
import { IDoctorAppointment } from '../../types';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const DoctorProfile = () => {
  const [loadedAppointments, setLoadedAppointments] = useState<
    IDoctorAppointment[]
  >([]);
  const { enqueueSnackbar } = useSnackbar();
  const { isLoading, sendRequest } = useHttpClient();
  const { token, profileId } = useContext(AuthContext);

  const fetchAppointments = async () => {
    try {
      const responseData = await sendRequest(
        `http://${window.location.hostname}:5000/api/appointments/doctor/${profileId}`,
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
          address: appointment.patientId.address,
          patientName: appointment.patientId.name,
          patientAge: appointment.patientId.age,
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
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [sendRequest, profileId, token]);

  return (
    <div className="divWithMargin">
      <Link to="/doctor/config">
        <Button variant="contained" color="primary">
          Edit your profile
        </Button>
      </Link>
      <DoctorAppointmentsHeader />
      {isLoading && <LoadingSpinner />}
      {!isLoading && loadedAppointments && (
        <DoctorAppointmentList
          appointments={loadedAppointments}
          onUpdate={fetchAppointments}
        />
      )}
    </div>
  );
};

export default DoctorProfile;
