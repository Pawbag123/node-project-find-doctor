import React, { useState } from 'react';
import {
  FormControl,
  MenuItem,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { IObject } from '../../types';

interface DoctorConfigCausesProps {
  specialtyId: string;
  selectedCauses: string[];
  setSelectedCauses: (causes: string[]) => void;
  allCauses: IObject[];
  addNewCause: (causeName: string) => Promise<void>;
  error?: string;
}

const DoctorConfigCauses: React.FC<DoctorConfigCausesProps> = ({
  specialtyId,
  selectedCauses,
  setSelectedCauses,
  allCauses,
  addNewCause,
  error,
}) => {
  const [newCause, setNewCause] = useState<string>('');
  const [openCauseDialog, setOpenCauseDialog] = useState<boolean>(false);

  // Add a new cause to the list
  const handleAddCause = async () => {
    if (newCause && specialtyId) {
      await addNewCause(newCause);
      setNewCause('');
      setOpenCauseDialog(false);
    }
  };

  // Handle the selection of an existing cause
  const handleCauseChange = (index: number, causeId: string) => {
    const selectedCause = allCauses.find((cause) => cause.id === causeId);
    if (selectedCause) {
      // Prevent duplicate selection
      if (selectedCauses.some((c) => c === causeId)) {
        alert('This cause has already been selected.');
        return;
      }

      const updatedCauses = [...selectedCauses];
      updatedCauses[index] = selectedCause.id;
      setSelectedCauses(updatedCauses);
    }
  };

  // Remove a cause from the list
  const handleRemoveCause = (index: number) => {
    const updatedCauses = selectedCauses.filter((_, i) => i !== index);
    setSelectedCauses(updatedCauses);
  };

  // Add a new empty cause input field
  const handleAddNextCause = () => {
    setSelectedCauses([...selectedCauses, '']);
  };

  return (
    <>
      {/* Ensure at least one input field is visible */}
      {selectedCauses.length === 0 && handleAddNextCause()}

      {selectedCauses.map((cause, index) => (
        <Grid container spacing={2} key={index}>
          <Grid item xs={10}>
            <FormControl fullWidth margin="normal" error={!!error}>
              <TextField
                label="Cause"
                id="cause"
                variant="outlined"
                required={true}
                disabled={!specialtyId}
                select
                value={cause}
                onChange={(e) => handleCauseChange(index, e.target.value)}
              >
                <MenuItem value="">None</MenuItem>{' '}
                {allCauses?.map((cause) => (
                  <MenuItem key={cause.id} value={cause.id}>
                    {cause.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            {index === selectedCauses.length - 1 && index === 0 && (
              <Button
                color="primary"
                variant="outlined"
                onClick={handleAddNextCause}
                disabled={!specialtyId}
                style={{ height: '66px', width: '90px', marginTop: '16px' }}
                startIcon={<AddIcon />}
              >
                Add More Causes
              </Button>
            )}
            {index === selectedCauses.length - 1 && index !== 0 && (
              <IconButton
                color="primary"
                onClick={handleAddNextCause}
                style={{ marginTop: '16px' }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Grid>
          <Grid item xs={1}>
            {selectedCauses.length > 1 && index !== 0 && (
              <IconButton
                color="secondary"
                onClick={() => handleRemoveCause(index)}
                style={{ marginTop: '16px' }}
              >
                <RemoveIcon />
              </IconButton>
            )}
          </Grid>
        </Grid>
      ))}

      {/* Button to open dialog for adding a new cause */}
      <Grid item xs={12}>
        <Button
          variant="outlined"
          disabled={!specialtyId}
          onClick={() => setOpenCauseDialog(true)}
          startIcon={<AddIcon />}
          style={{ height: '56px', width: '150px', marginTop: '16px' }}
        >
          Add New Cause
        </Button>
      </Grid>

      {/* Dialog for creating a new cause */}
      <Dialog open={openCauseDialog} onClose={() => setOpenCauseDialog(false)}>
        <DialogTitle>Add New Cause</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Cause"
            fullWidth
            value={newCause}
            onChange={(e) => setNewCause(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCauseDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddCause}
            disabled={!specialtyId}
            color="primary"
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DoctorConfigCauses;
