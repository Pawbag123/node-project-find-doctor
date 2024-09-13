import { useContext, useState, useEffect } from 'react';
import { Grid, Typography, Button, TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import './DoctorConfig.css';
import DoctorConfigSpecialty from '../components/DoctorConfigSpecialty';
import DoctorConfigCauses from '../components/DoctorConfigCauses';
import DoctorConfigAvailability from '../components/DoctorConfigAvailability';
import { IDoctor, IDoctorProfile, IObject } from '../../types';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { generateAvailability } from '../../shared/utils/generateAvailability';

const DoctorConfig = () => {
  const navigate = useNavigate();
  const { token, profileId } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const { sendRequest: getSpecialtiesRequest } = useHttpClient();
  const { sendRequest: getCausesRequest } = useHttpClient();
  const { sendRequest: postSpecialtyRequest } = useHttpClient();
  const { sendRequest: postCauseRequest } = useHttpClient();
  const { sendRequest: getDoctorRequest } = useHttpClient();
  const { sendRequest: putDoctorRequest, isLoading } = useHttpClient();
  const [doctor, setDoctor] = useState<IDoctorProfile | null>(null);
  const [address, setAddress] = useState('');
  const [allSpecialties, setAllSpecialties] = useState<IObject[]>([]);
  const [allCauses, setAllCauses] = useState<IObject[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [availability, setAvailability] = useState(
    Array(7).fill({ from: null as Dayjs | null, to: null as Dayjs | null })
  );
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasDataBeenLoaded, setHasDataBeenLoaded] = useState(false);
  const [errors, setErrors] = useState({
    address: '',
    availability: '',
    specialty: '',
    causes: '',
  });

  const mapAvailability = (availability: IDoctor['availability']) => {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return daysOfWeek.map((day) => {
      const dayAvailability =
        availability[day as keyof IDoctor['availability']];
      if (!dayAvailability || dayAvailability.length === 0) {
        return { from: null, to: null };
      }
      const fromTime = dayjs(dayAvailability[0], 'HH:mm');
      const toTime = dayjs(
        dayAvailability[dayAvailability.length - 1],
        'HH:mm'
      ).add(30, 'minute');
      return {
        from: fromTime,
        to: toTime,
      };
    });
  };

  const generateAvailabilityObject = (
    availability: { from: Dayjs | null; to: Dayjs | null }[]
  ) => {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const availabilityObj: Partial<IDoctor['availability']> = {};

    availability.forEach((day, index) => {
      if (day.from && day.to) {
        const dayOfWeek = daysOfWeek[index] as keyof IDoctor['availability'];
        availabilityObj[dayOfWeek] = generateAvailability(
          day.from.format('HH:mm'),
          day.to.format('HH:mm')
        );
      }
    });

    return availabilityObj;
  };

  const loadSpecialties = async () => {
    try {
      const specialtiesData = await getSpecialtiesRequest(
        `http://${window.location.hostname}:5000/api/specialties/`
      );
      setAllSpecialties(specialtiesData.specialties);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(`error when fetching specialties: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const loadCauses = async () => {
    try {
      const causesData = await getCausesRequest(
        `http://${window.location.hostname}:5000/api/causes/${selectedSpecialty}`
      );
      setAllCauses(causesData.causes);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        enqueueSnackbar(`Error fetching causes: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const fetchDoctor = async () => {
    try {
      const doctorData = await getDoctorRequest(
        `http://${window.location.hostname}:5000/api/doctors/${profileId}`,
        'GET',
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      setDoctor({
        id: doctorData.doctor.id,
        image: doctorData.doctor.image,
        name: doctorData.doctor.name,
        address: doctorData.doctor.address,
        specialtyId: doctorData.doctor.specialtyId,
        causes: doctorData.doctor.causes,
        availability: doctorData.doctor.availability,
      });
      setAddress(doctorData.doctor.address);
      setSelectedSpecialty(doctorData.doctor.specialtyId);
      setAvailability(mapAvailability(doctorData.doctor.availability));
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching doctor aborted');
      } else {
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    loadSpecialties();
  }, [getSpecialtiesRequest]);

  useEffect(() => {
    if (!selectedSpecialty) return;
    loadCauses();
  }, [selectedSpecialty, getCausesRequest]);

  useEffect(() => {
    fetchDoctor();
  }, [getDoctorRequest]);

  useEffect(() => {
    if (
      !hasDataBeenLoaded &&
      doctor &&
      allSpecialties.length > 0 &&
      allCauses.length > 0
    ) {
      setSelectedCauses(doctor.causes);

      setIsDataLoaded(true);
      setHasDataBeenLoaded(true);
    }
  }, [doctor, allSpecialties, allCauses, hasDataBeenLoaded]);

  const handleSpecialtySubmit = async (specialtyName: string) => {
    try {
      await postSpecialtyRequest(
        `http://${window.location.hostname}:5000/api/specialties/`,
        'POST',
        JSON.stringify({ name: specialtyName }),
        {
          'Content-Type': 'application/json',
        }
      );
      enqueueSnackbar('Specialty added successfully', { variant: 'success' });
      loadSpecialties();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(`Error adding specialty: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const handleSpecialtyChange = async (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setSelectedCauses([]); // Reset the cause to empty when a new specialty is selected
    try {
      const causesData = await getCausesRequest(
        `http://${window.location.hostname}:5000/api/causes/${specialtyId}`
      );
      setAllCauses(causesData.causes);
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(`Error fetching causes: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  const handleCauseSubmit = async (causeName: string) => {
    try {
      await postCauseRequest(
        `http://${window.location.hostname}:5000/api/causes/`,
        'POST',
        JSON.stringify({ name: causeName, specialtyId: selectedSpecialty }),
        {
          'Content-Type': 'application/json',
        }
      );
      enqueueSnackbar('Cause added successfully', { variant: 'success' });
      loadCauses();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(`Error adding cause: ${err.message}`, {
          variant: 'error',
        });
      }
    }
  };

  const resetData = () => {
    setAddress(doctor?.address || '');
    setSelectedSpecialty(doctor?.specialtyId || '');
    setSelectedCauses(doctor?.causes || []);
    setAvailability(mapAvailability(doctor?.availability || {}));
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    try {
      await putDoctorRequest(
        `http://${window.location.hostname}:5000/api/doctors/${profileId}`,
        'PATCH',
        JSON.stringify({
          name: doctor!.name,
          image: doctor!.image,
          address,
          specialtyId: selectedSpecialty,
          causes: selectedCauses,
          availability: generateAvailabilityObject(availability),
        }),
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      );
      enqueueSnackbar('Doctor profile updated successfully', {
        variant: 'success',
      });
      navigate('/doctor');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn('fetching specialties aborted');
      } else {
        console.error(err);
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    }
  };

  const validateForm = () => {
    const validationErrors = {
      address: '',
      availability: '',
      specialty: '',
      causes: '',
    };
    let isValid = true;

    if (!address) {
      validationErrors.address = 'Address is required.';
      isValid = false;
    }

    // Validate specialty
    if (!selectedSpecialty) {
      validationErrors.specialty = 'Specialty is required.';
      isValid = false;
    }

    availability.map((day) => {
      if (day.from && !day.to) {
        validationErrors.availability =
          'Please fill in all availability fields.';
        enqueueSnackbar('Please fill in all availability fields.', {
          variant: 'error',
        });
        isValid = false;
      }
      if (!day.from && day.to) {
        validationErrors.availability =
          'Please fill in all availability fields.';
        enqueueSnackbar('Please fill in all availability fields.', {
          variant: 'error',
        });
        isValid = false;
      }
    });

    const generatedAvailability = generateAvailabilityObject(availability);
    if (Object.values(generatedAvailability).every((arr) => arr.length === 0)) {
      validationErrors.availability =
        'Availability for at least one day is required.';
      enqueueSnackbar('Availability for at least one day is required.', {
        variant: 'error',
      });
      isValid = false;
    }

    // Validate causes
    if (
      !selectedCauses ||
      (selectedCauses.length > 0 &&
        !selectedCauses.every((cause) => cause !== ''))
    ) {
      validationErrors.causes = 'All cause fields must be filled.';
      enqueueSnackbar('All cause fields must be filled.', { variant: 'error' });
      isValid = false;
    }

    setErrors(validationErrors);
    return isValid;
  };

  return (
    <div style={{ margin: '70px' }}>
      <Typography variant="h4" gutterBottom>
        Doctor Configuration
      </Typography>
      {!isDataLoaded && <LoadingSpinner />}
      {isLoading && <LoadingSpinner asOverlay />}
      {isDataLoaded && (
        <form>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%' }}
              error={Boolean(errors.address)}
              helperText={errors.address}
            />
          </Grid>
          <Grid container spacing={2}>
            <DoctorConfigSpecialty
              selectedSpecialty={selectedSpecialty}
              handleSpecialtyChange={handleSpecialtyChange}
              allSpecialties={allSpecialties}
              addNewSpecialty={handleSpecialtySubmit}
              error={errors.specialty}
            />
            <DoctorConfigCauses
              specialtyId={selectedSpecialty}
              selectedCauses={selectedCauses}
              setSelectedCauses={setSelectedCauses}
              allCauses={allCauses}
              addNewCause={handleCauseSubmit}
              error={errors.causes}
            />
            <Grid item xs={12}>
              <DoctorConfigAvailability
                availability={availability}
                setAvailability={setAvailability}
              />
            </Grid>
            <Grid
              item
              xs={12}
              style={{ textAlign: 'right', marginTop: '20px' }}
            >
              <Link to="/doctors">
                <Button
                  variant="contained"
                  color="error"
                  style={{ marginRight: '10px', width: '100px' }}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                variant="contained"
                color="error"
                onClick={resetData}
                style={{ marginRight: '10px', width: '100px' }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ marginRight: '10px', width: '100px' }}
                onClick={handleConfirm}
              >
                Confirm
              </Button>
            </Grid>
          </Grid>
        </form>
      )}
    </div>
  );
};

export default DoctorConfig;
