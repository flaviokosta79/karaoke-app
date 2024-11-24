import React, { useState } from 'react';
import { Box, Paper, Drawer, IconButton, Typography, useTheme } from '@mui/material';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import SettingsIcon from '@mui/icons-material/Settings';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';

const DRAWER_WIDTH = 350;

function PlayerLayout({ 
  children,
  playlist,
  onPlaylistClose,
  isPlaylistOpen,
  onPlaylistToggle
}) {
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      bgcolor: '#000',
      color: 'white'
    }}>
      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        marginRight: isPlaylistOpen ? `${DRAWER_WIDTH}px` : 0,
      }}>
        {children}

        {/* Top Bar */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          bgcolor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Karaoke Night
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              color="primary"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton 
              color="primary"
              onClick={onPlaylistToggle}
            >
              <QueueMusicIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Playlist Drawer */}
      <Drawer
        variant="persistent"
        anchor="right"
        open={isPlaylistOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: '#1a1a1a',
            color: 'white',
            borderLeft: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Playlist
            </Typography>
            <IconButton color="primary" onClick={onPlaylistClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Playlist Content */}
          <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
            {playlist}
          </Box>
        </Box>
      </Drawer>

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            bgcolor: '#1a1a1a',
            color: 'white'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Settings
            </Typography>
            <IconButton color="primary" onClick={() => setSettingsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Settings Content */}
          <Box sx={{ mt: 2 }}>
            {/* Add your settings components here */}
          </Box>
        </Box>
      </Drawer>

      {/* Singer Info Bar */}
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          bgcolor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          zIndex: 1200
        }}
      >
        <MicIcon color="primary" />
        <Typography variant="subtitle1">
          Current Singer: John
        </Typography>
      </Paper>
    </Box>
  );
}

export default PlayerLayout;
