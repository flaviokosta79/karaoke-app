import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  useTheme
} from '@mui/material';
import { MusicNote as MusicIcon } from '@mui/icons-material';

function CurrentSong({ currentSong }) {
  const theme = useTheme();

  if (!currentSong) {
    return (
      <Card 
        variant="outlined"
        sx={{
          bgcolor: 'background.default',
          borderStyle: 'dashed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          minHeight: 140
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <MusicIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1">
            Nenhuma música tocando no momento
          </Typography>
        </Box>
      </Card>
    );
  }

  const progress = (currentSong.currentTime / currentSong.duration) * 100 || 0;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
            {currentSong.title}
          </Typography>
          <Typography variant="subtitle1">
            {currentSong.artist}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white'
              }
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {formatTime(currentSong.currentTime)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {formatTime(currentSong.duration)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.1)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 160,
          height: 160,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 255, 255, 0.05)'
        }}
      />
    </Card>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default CurrentSong;
