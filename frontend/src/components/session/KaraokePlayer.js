import React from 'react';
import { Paper, Typography } from '@mui/material';

function KaraokePlayer() {
  return (
    <Paper 
      elevation={3}
      sx={{
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        mb: 2
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Área do Player de Karaokê
      </Typography>
      {/* Player components will be added here */}
    </Paper>
  );
}

export default KaraokePlayer;
