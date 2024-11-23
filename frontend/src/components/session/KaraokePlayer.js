import React, { useState, useRef, useEffect } from 'react';
import { Paper, Typography, Box, IconButton, useTheme, Slider, Stack } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { config } from '../../config';
import io from 'socket.io-client';

function KaraokePlayer({ song, isHost, sessionId }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [currentLyric, setCurrentLyric] = useState('');
  const [nextLyric, setNextLyric] = useState('');
  const socketRef = useRef();
  
  const theme = useTheme();
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const sessionUrl = `${window.location.origin}/setup/${sessionId}`;

  // Inicializar socket
  useEffect(() => {
    if (isHost && sessionId) {
      socketRef.current = io(config.backendUrl);
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [isHost, sessionId]);

  // Carregar letras da música
  useEffect(() => {
    if (song?.id) {
      fetch(`${config.backendUrl}/api/songs/${song.id}/lyrics`)
        .then(res => res.json())
        .then(data => {
          setLyrics(data.lines || []);
        })
        .catch(error => {
          console.error('Error loading lyrics:', error);
        });
    }
  }, [song]);

  // Configurar o áudio quando uma nova música é carregada
  useEffect(() => {
    if (song?.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audioUrl = `${config.backendUrl}${song.audioUrl}`;
      console.log('Loading audio from:', audioUrl);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded, duration:', audioRef.current.duration);
        setDuration(audioRef.current.duration * 1000);
        // Iniciar reprodução automaticamente
        handlePlayPause();
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
      });

      audioRef.current.addEventListener('play', () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      });

      audioRef.current.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });

      audioRef.current.addEventListener('ended', () => {
        console.log('Audio ended');
        setIsPlaying(false);
        clearInterval(progressInterval.current);
        setCurrentTime(0);
        // Emitir evento para o servidor para reproduzir a próxima música da fila
        if (isHost && socketRef.current) {
          console.log('Requesting next song...');
          socketRef.current.emit('playNextSong', { sessionId });
        }
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [song, volume, isHost, sessionId]);

  // Atualizar volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Atualizar letras baseado no tempo
  useEffect(() => {
    if (!lyrics.length) return;

    const currentLine = lyrics.find(
      line => currentTime >= line.startTime && currentTime <= line.endTime
    );
    const nextLine = lyrics.find(
      line => currentTime < line.startTime
    );

    setCurrentLyric(currentLine?.text || '');
    setNextLyric(nextLine?.text || '');
  }, [currentTime, lyrics]);

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

  // Função para reproduzir/pausar o áudio
  const handlePlayPause = async () => {
    if (!audioRef.current) {
      console.error('Audio element not initialized');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
        clearInterval(progressInterval.current);
      } else {
        console.log('Starting audio playback');
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          startProgressInterval();
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing/pausing audio:', error);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue / 1000;
      setCurrentTime(newValue);
    }
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Paper 
      elevation={3}
      ref={playerRef}
      sx={{
        height: isFullscreen ? '100vh' : '400px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        mb: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: 3
      }}>
        {/* Song Title */}
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {song ? `${song.title} - ${song.artist}` : 'Área do Player de Karaokê'}
        </Typography>

        {/* Lyrics Display */}
        {song && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              {currentLyric || '♪ ♫ ♪ ♫'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {nextLyric}
            </Typography>
          </Box>
        )}

        {/* Player Controls */}
        {isHost && song && (
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            {/* Progress Bar */}
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              sx={{ mb: 2 }}
            />

            {/* Time Display */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="caption">
                {new Date(currentTime).toISOString().substr(14, 5)}
              </Typography>
              <Typography variant="caption">
                {new Date(duration).toISOString().substr(14, 5)}
              </Typography>
            </Box>

            {/* Controls */}
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={handlePlayPause} size="large">
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 'auto' }}>
                <IconButton onClick={handleMuteToggle}>
                  {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{ width: 100 }}
                />
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>

      {/* QR Code Area - Only show for host */}
      {isHost && (
        <Box
          sx={{
            position: 'absolute',
            left: theme.spacing(2),
            bottom: theme.spacing(2),
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: theme.spacing(1),
            borderRadius: theme.shape.borderRadius,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              mb: 1,
              color: 'black',
              textShadow: '1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff',
              fontWeight: 'bold'
            }}
          >
            ID: {sessionId}
          </Typography>
          <QRCodeCanvas value={sessionUrl} size={100} />
        </Box>
      )}

      {/* Fullscreen Button */}
      <IconButton
        onClick={handleFullscreenToggle}
        sx={{
          position: 'absolute',
          right: theme.spacing(2),
          bottom: theme.spacing(2),
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
          },
        }}
      >
        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
      </IconButton>
    </Paper>
  );
}

export default KaraokePlayer;
