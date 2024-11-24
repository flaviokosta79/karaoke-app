import React from 'react';
import { Box, Slider, Typography, IconButton, Stack, Paper } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MicIcon from '@mui/icons-material/Mic';
import SpeedIcon from '@mui/icons-material/Speed';
import TuneIcon from '@mui/icons-material/Tune';

function AudioControls({ 
  volume, 
  onVolumeChange, 
  isMuted, 
  onMuteToggle,
  musicVolume = 1,
  onMusicVolumeChange,
  vocalVolume = 1,
  onVocalVolumeChange,
  pitch = 0,
  onPitchChange,
  tempo = 1,
  onTempoChange
}) {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        position: 'fixed', 
        bottom: 80, 
        right: 20,
        width: 300,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        color: 'white'
      }}
    >
      <Stack spacing={2}>
        {/* Master Volume */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onMuteToggle} size="small" sx={{ color: 'white' }}>
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
          <Slider
            value={isMuted ? 0 : volume}
            onChange={(_, value) => onVolumeChange(value)}
            min={0}
            max={1}
            step={0.01}
            sx={{ color: 'primary.main' }}
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {Math.round(volume * 100)}%
          </Typography>
        </Box>

        {/* Music Volume */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" sx={{ color: 'white' }}>
            <MusicNoteIcon />
          </IconButton>
          <Slider
            value={musicVolume}
            onChange={(_, value) => onMusicVolumeChange(value)}
            min={0}
            max={1}
            step={0.01}
            sx={{ color: '#4CAF50' }}
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {Math.round(musicVolume * 100)}%
          </Typography>
        </Box>

        {/* Vocals Volume */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" sx={{ color: 'white' }}>
            <MicIcon />
          </IconButton>
          <Slider
            value={vocalVolume}
            onChange={(_, value) => onVocalVolumeChange(value)}
            min={0}
            max={1}
            step={0.01}
            sx={{ color: '#FF4081' }}
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {Math.round(vocalVolume * 100)}%
          </Typography>
        </Box>

        {/* Pitch Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" sx={{ color: 'white' }}>
            <TuneIcon />
          </IconButton>
          <Slider
            value={pitch}
            onChange={(_, value) => onPitchChange(value)}
            min={-12}
            max={12}
            step={1}
            sx={{ color: '#FFC107' }}
            marks
            valueLabelDisplay="auto"
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {pitch > 0 ? `+${pitch}` : pitch}
          </Typography>
        </Box>

        {/* Tempo Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" sx={{ color: 'white' }}>
            <SpeedIcon />
          </IconButton>
          <Slider
            value={tempo}
            onChange={(_, value) => onTempoChange(value)}
            min={0.5}
            max={1.5}
            step={0.1}
            sx={{ color: '#2196F3' }}
            marks
            valueLabelDisplay="auto"
          />
          <Typography variant="body2" sx={{ minWidth: 35 }}>
            {tempo}x
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default AudioControls;
