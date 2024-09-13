import React, { useState, useEffect } from 'react';
import { TextField, Button, FormControl, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';

import './DoctorsForm.css';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { IObject } from '../../types';

interface DoctorsFormProps {
  handleSearch: (
    specialtyId: string,
    causeId: string,
    town?: string,
    distance?: number
  ) => Promise<void>;
}

const DoctorsForm: React.FC<DoctorsFormProps> = ({ handleSearch }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedCause, setSelectedCause] = useState<string>('');
  const [town, setTown] = useState<string>('');
  const [selectedDistance, setSelectedDistance] = useState<number | undefined>(
    undefined
  );
  const {
    isLoading: isFetchingSpecialties,
    sendRequest: sendSpecialtiesRequest,
  } = useHttpClient();
  const { isLoading: isFetchingCauses, sendRequest: sendCausesRequest } =
    useHttpClient();
  const [specialties, setSpecialties] = useState<IObject[]>([]);
  const [causes, setCauses] = useState<IObject[]>([]);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const specialtiesData = await sendSpecialtiesRequest(
          `http://${window.location.hostname}:5000/api/specialties/`
        );
        setSpecialties(specialtiesData.specialties);
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

    loadSpecialties();
  }, [sendSpecialtiesRequest]);

  const handleSpecialtyChange = async (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setSelectedCause(''); // Reset the cause to empty when a new specialty is selected
    try {
      const causesData = await sendCausesRequest(
        `http://${window.location.hostname}:5000/api/causes/${specialtyId}`
      );
      setCauses(causesData.causes);
    } catch (err: any) {
      console.error(err);
      enqueueSnackbar(`error when fetching causes: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleSearch(
      selectedSpecialty,
      selectedCause,
      town,
      selectedDistance
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Specialty"
          id="specialty"
          variant="outlined"
          required={true}
          value={selectedSpecialty}
          select
          onChange={(event) => {
            handleSpecialtyChange(event.target.value as string);
          }}
        >
          {isFetchingSpecialties ? (
            <MenuItem disabled>Loading...</MenuItem>
          ) : (
            specialties?.map((specialty) => (
              <MenuItem key={specialty.id} value={specialty.id}>
                {specialty.name}
              </MenuItem>
            ))
          )}
        </TextField>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <TextField
          label="Cause"
          id="cause"
          variant="outlined"
          required={true}
          disabled={!selectedSpecialty || isFetchingCauses}
          select
          value={selectedCause}
          onChange={(event) => setSelectedCause(event.target.value as string)}
        >
          <MenuItem value="">None</MenuItem>{' '}
          {isFetchingCauses ? (
            <MenuItem disabled>Loading causes...</MenuItem>
          ) : (
            causes?.map((cause) => (
              <MenuItem key={cause.id} value={cause.id}>
                {cause.name}
              </MenuItem>
            ))
          )}
        </TextField>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Town"
          id="town"
          variant="outlined"
          value={town}
          onChange={(event) => setTown(event.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Distance"
          id="distance"
          type="number"
          variant="outlined"
          disabled={!town}
          value={selectedDistance || ''}
          onChange={(event) => setSelectedDistance(Number(event.target.value))}
          inputProps={{
            min: 5,
            max: 1000,
            step: 1,
          }}
        />
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        disabled={!selectedCause || (!!town && !selectedDistance)}
      >
        Find Doctor
      </Button>
    </form>
  );
};

export default DoctorsForm;
