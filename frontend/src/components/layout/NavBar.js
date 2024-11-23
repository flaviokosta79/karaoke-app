import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import {
  Home as HomeIcon,
  QueueMusic as QueueMusicIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSession = location.pathname.includes('/session');

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="home"
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          <HomeIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Karaoke Social
        </Typography>

        {isSession && (
          <>
            <IconButton color="inherit" aria-label="queue">
              <QueueMusicIcon />
            </IconButton>
            <IconButton color="inherit" aria-label="settings">
              <SettingsIcon />
            </IconButton>
          </>
        )}

        {!isSession && (
          <Button color="inherit" onClick={() => navigate('/setup')}>
            Entrar
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
