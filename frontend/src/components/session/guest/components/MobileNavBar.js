import React from 'react';
import { 
  BottomNavigation, 
  BottomNavigationAction,
  Paper
} from '@mui/material';
import {
  QueueMusic as QueueIcon,
  Search as SearchIcon,
  Group as GroupIcon
} from '@mui/icons-material';

function MobileNavBar({ activeTab, onTabChange }) {
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderRadius: 0
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={activeTab}
        onChange={(event, newValue) => {
          onTabChange(newValue);
        }}
        showLabels
      >
        <BottomNavigationAction
          label="Fila"
          value="queue"
          icon={<QueueIcon />}
        />
        <BottomNavigationAction
          label="Buscar"
          value="search"
          icon={<SearchIcon />}
        />
        <BottomNavigationAction
          label="Participantes"
          value="participants"
          icon={<GroupIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default MobileNavBar;
