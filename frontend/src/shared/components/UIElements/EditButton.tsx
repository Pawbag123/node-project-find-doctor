import React from 'react';
import { IconButton, Typography, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface EditButtonProps {
  text: string;
  onClick: () => void;
}

const EditButton: React.FC<EditButtonProps> = ({ text, onClick }) => (
  <Box sx={{ textAlign: 'center', marginRight: 2 }}>
    <IconButton aria-label="edit" sx={{ color: '#ffc107' }} onClick={onClick}>
      {' '}
      {/* Yellow for Edit */}
      <EditIcon />
    </IconButton>
    <Typography variant="caption" display="block">
      {text}
    </Typography>
  </Box>
);

export { EditButton };
