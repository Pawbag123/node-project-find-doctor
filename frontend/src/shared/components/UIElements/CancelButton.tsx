import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

interface CancelButtonProps {
  onClick: () => Promise<void>;
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick }) => (
  <Box sx={{ textAlign: 'center', marginRight: 2 }}>
    <IconButton aria-label="cancel" sx={{ color: '#dc3545' }} onClick={onClick}>
      {' '}
      {/* Red for Cancel */}
      <CancelIcon />
    </IconButton>
    <Typography variant="caption" display="block">
      Cancel
    </Typography>
  </Box>
);

export { CancelButton };
