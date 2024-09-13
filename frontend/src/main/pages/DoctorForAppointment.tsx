import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';

import DoctorItem from '../components/DoctorItem';
import AppointmentForm from '../../shared/components/AppointmentForm';
import { IDoctorForAppointment, IBookedSlots } from '../../types';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { mapAppointmentsToTime } from '../../shared/utils/mapDoctorsAppointments';

const DoctorForAppointment = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const { token } = useContext(AuthContext);
  const { sendRequest, isLoading } = useHttpClient();
  const [doctor, setDoctor] = useState<IDoctorForAppointment | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const responseData = await sendRequest(
          `http://${window.location.hostname}:5000/api/doctors/appointment/${doctorId}`,
          'GET',
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
        let bookedSlots: IBookedSlots = {};
        if (responseData.doctor.appointments) {
          bookedSlots = mapAppointmentsToTime(responseData.doctor.appointments);
        }
        setDoctor({
          id: responseData.doctor.id,
          image: responseData.doctor.image,
          name: responseData.doctor.name,
          address: responseData.doctor.address,
          specialty: {
            id: responseData.doctor.specialtyId.id,
            name: responseData.doctor.specialtyId.name,
          },
          causes: responseData.doctor.causes.map((cause: any) => ({
            id: cause.id,
            name: cause.name,
          })),
          availability: responseData.doctor.availability,
          bookedSlots,
        });
        // setDoctor({ ...doctorData, bookedSlots });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.warn('fetching specialties aborted');
        } else {
          enqueueSnackbar(err.message, { variant: 'error' });
        }
      }
    };

    fetchDoctor();
  }, [sendRequest, doctorId, token]);

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {!isLoading && doctor && (
        <Card>
          <CardContent>
            <DoctorItem
              doctor={{
                id: doctor.id,
                image: doctor.image,
                name: doctor.name,
                address: doctor.address,
                specialty: doctor.specialty,
                causes: doctor.causes,
              }}
            />
            <Typography variant="h6" gutterBottom>
              Make an Appointment
            </Typography>
            <AppointmentForm doctor={doctor} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DoctorForAppointment;
