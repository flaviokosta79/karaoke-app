import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Paper,
  Grid,
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  SkipNext as SkipNextIcon,
  Search as SearchIcon,
  Star as StarIcon,
  PhoneAndroid as SmartphoneIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  DragIndicator as GripVerticalIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon
} from '@mui/icons-material';

function KaraokePlayer({ song, socket, sessionId, isHost }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLyric, setCurrentLyric] = useState('');
  const [nextLyric, setNextLyric] = useState('');
  const audioRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    if (song?.audioUrl) {
      audioRef.current = new Audio(song.audioUrl);
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration * 1000); // Convert to milliseconds
      });
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [song]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!song?.lyrics) return;

    const updateLyrics = () => {
      const currentTimeMs = currentTime;
      const currentLine = song.lyrics.find(
        line => currentTimeMs >= line.startTime && currentTimeMs <= line.endTime
      );
      const nextLine = song.lyrics.find(
        line => currentTimeMs < line.startTime
      );

      setCurrentLyric(currentLine?.text || '');
      setNextLyric(nextLine?.text || '');
    };

    updateLyrics();
  }, [currentTime, song]);

  const startProgressInterval = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime * 1000);
      }
    }, 100);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (socket && isHost) {
        socket.emit('pauseSong', { sessionId, currentTime });
      }
    } else {
      audioRef.current.play();
      if (socket && isHost) {
        socket.emit('playSong', { 
          sessionId, 
          song, 
          startTime: Date.now() - currentTime 
        });
      }
      startProgressInterval();
    }

    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue / 1000;
      setCurrentTime(newValue);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {/* Current Lyrics Display */}
          <Box sx={{ 
            minHeight: 120, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}>
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 1
              }}
            >
              {currentLyric || '♪ ♫ ♪ ♫'}
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{ color: 'text.secondary' }}
            >
              {nextLyric}
            </Typography>
          </Box>

          {/* Playback Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton onClick={handlePlayPause} disabled={!isHost}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              disabled={!isHost}
              sx={{ mx: 2 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 180 }}>
              <IconButton onClick={handleMuteToggle}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                sx={{ ml: 1 }}
              />
            </Box>
          </Box>

          {/* Time Display */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">
              {new Date(currentTime).toISOString().substr(14, 5)}
            </Typography>
            <Typography variant="caption">
              {new Date(duration).toISOString().substr(14, 5)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default KaraokePlayer;
