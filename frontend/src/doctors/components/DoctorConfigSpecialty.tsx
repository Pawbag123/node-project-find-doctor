import React, { useState } from 'react';
import {
  FormControl,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import './DoctorConfigSpecialty.css';
import { IObject } from '../../types';

interface DoctorConfigSpecialtyProps {
  selectedSpecialty: string;
  handleSpecialtyChange: (specialtyId: string) => Promise<void>;
  allSpecialties: IObject[];
  addNewSpecialty: (specialtyName: string) => Promise<void>;
  error?: string;
}

const DoctorConfigSpecialty: React.FC<DoctorConfigSpecialtyProps> = ({
  selectedSpecialty,
  handleSpecialtyChange,
  allSpecialties,
  addNewSpecialty,
  error,
}) => {
  const [newSpecialty, setNewSpecialty] = useState<string>('');
  const [openSpecialtyDialog, setOpenSpecialtyDialog] =
    useState<boolean>(false);

  const handleAddSpecialty = async () => {
    if (newSpecialty) {
      await addNewSpecialty(newSpecialty);
      setNewSpecialty('');
      setOpenSpecialtyDialog(false);
    }
  };

  return (
    <>
      <Grid item xs={10}>
        <FormControl fullWidth margin="normal" error={!!error}>
          <TextField
            label="Specialty"
            id="specialty"
            variant="outlined"
            required={true}
            value={selectedSpecialty}
            select
            error={!!error}
            helperText={error}
            onChange={(event) => {
              handleSpecialtyChange(event.target.value as string);
            }}
          >
            {allSpecialties?.map((specialty) => (
              <MenuItem key={specialty.id} value={specialty.id}>
                {specialty.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="outlined"
          onClick={() => setOpenSpecialtyDialog(true)}
          startIcon={<AddIcon />}
          style={{ height: '56px', marginTop: '16px' }}
        >
          Add New Specialty
        </Button>
      </Grid>

      <Dialog
        open={openSpecialtyDialog}
        onClose={() => setOpenSpecialtyDialog(false)}
      >
        <DialogTitle>Add New Specialty</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Specialty"
            fullWidth
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSpecialtyDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSpecialty} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DoctorConfigSpecialty;
