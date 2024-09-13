import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

interface AcceptButtonProps {
  onClick: () => Promise<void>;
}

const AcceptButton: React.FC<AcceptButtonProps> = ({ onClick }) => (
  <Box sx={{ textAlign: 'center', marginRight: 2 }}>
    <IconButton aria-label="accept" sx={{ color: '#28a745' }} onClick={onClick}>
      {' '}
      <CheckIcon />
    </IconButton>
    <Typography variant="caption" display="block">
      Accept
    </Typography>
  </Box>
);

export { AcceptButton };
