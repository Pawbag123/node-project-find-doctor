import { useState } from 'react';
import { useSnackbar } from 'notistack';

import './MainPage.css';
import DoctorsList from '../components/DoctorsList';
import { IDoctorListed } from '../../types';
import DoctorsForm from '../components/DoctorsForm';
import DoctorsFormHeader from '../components/DoctorsFormHeader';
import { useHttpClient } from '../../shared/hooks/http-hook';

const MainPage = () => {
  const [doctors, setDoctors] = useState<IDoctorListed[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const { sendRequest, isLoading } = useHttpClient();
  const [isFetched, setIsFetched] = useState(false);

  const handleSearch = async (
    specialtyId: string,
    causeId: string,
    town?: string,
    distance?: number
  ) => {
    const url = town
      ? `http://${window.location.hostname}:5000/api/doctors/${specialtyId}/${causeId}/${town}/${distance}`
      : `http://${window.location.hostname}:5000/api/doctors/${specialtyId}/${causeId}`;
    try {
      const responseData = await sendRequest(url);
      // console.log(responseData);
      setDoctors(
        responseData.doctors.map((doctor: any) => {
          return {
            id: doctor.id,
            image: doctor.image,
            name: doctor.name,
            address: doctor.address,
            specialty: {
              id: doctor.specialtyId.id,
              name: doctor.specialtyId.name,
            },
            causes: doctor.causes.map((cause: any) => ({
              id: cause.id,
              name: cause.name,
            })),
            distance: doctor.distance,
          };
        })
      );
      setIsFetched(true);
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(`error when fetching doctors: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  return (
    <div className="main-page">
      <DoctorsFormHeader />
      <DoctorsForm handleSearch={handleSearch} />
      {isFetched && (
        <DoctorsList filteredDoctors={doctors} isLoading={isLoading} />
      )}
    </div>
  );
};

export default MainPage;
