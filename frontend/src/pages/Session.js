import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
} from '@mui/material';
import { io } from 'socket.io-client';
import { QRCodeCanvas } from 'qrcode.react';
import KaraokePlayer from '../components/session/KaraokePlayer';
import ParticipantsList from '../components/session/ParticipantsList';
import SongQueue from '../components/session/SongQueue';
import SongList from '../components/SongList';
import { config } from '../config';

function Session() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [songQueue, setSongQueue] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const sessionUrl = `${window.location.origin}/setup/${sessionId}`;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      setError('User data not found');
      return;
    }

    setIsHost(userData.isHost);

    // Connect to Socket.IO
    const newSocket = io(config.backendUrl);
    setSocket(newSocket);
    
    // Join session
    console.log('Joining session with user data:', userData);
    newSocket.emit('joinSession', {
      sessionId,
      user: userData,
    });

    // Socket event listeners
    newSocket.on('userList', (updatedUsers) => {
      console.log('Users updated:', updatedUsers);
      setUsers(updatedUsers);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
    });

    newSocket.on('songQueue', (updatedQueue) => {
      console.log('Song queue updated:', updatedQueue);
      setSongQueue(updatedQueue || []);
    });

    newSocket.on('currentSong', (song) => {
      console.log('Current song updated:', song);
      setCurrentSong(song);
    });

    // Fetch initial session data
    fetch(`${config.backendUrl}/api/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSession(data);
          setUsers(data.users || []);
          setSongQueue(data.songQueue || []);
          setCurrentSong(data.currentSong);
        }
      })
      .catch((err) => {
        console.error('Error fetching session:', err);
        setError('Failed to fetch session data');
      });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [sessionId]);

  const handleAddToQueue = async (song) => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const songWithUser = {
        ...song,
        user: userData.name
      };
      
      console.log('Adding song to queue:', songWithUser);
      socket.emit('addToQueue', {
        sessionId,
        song: songWithUser
      });
    } catch (error) {
      console.error('Error adding song to queue:', error);
      setError('Failed to add song to queue');
    }
  };

  const handleRemoveFromQueue = (index) => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    try {
      console.log('Removing song at index:', index);
      socket.emit('removeFromQueue', {
        sessionId,
        index
      });
    } catch (error) {
      console.error('Error removing song from queue:', error);
      setError('Failed to remove song from queue');
    }
  };

  const handlePlaySong = async (song) => {
    if (!socket || !isHost) {
      console.error('Cannot play song: socket not connected or not host');
      return;
    }
    
    try {
      console.log('Playing song:', song);
      socket.emit('playSong', {
        sessionId,
        song
      });
    } catch (error) {
      console.error('Error playing song:', error);
      setError('Failed to play song');
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, height: 'calc(100vh - 128px)' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Player Area */}
        <Grid item xs={12} md={8}>
          <KaraokePlayer
            song={currentSong}
            socket={socket}
            sessionId={sessionId}
            isHost={isHost}
          />
          <Box sx={{ mt: 2, height: 'calc(100% - 432px)' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <SongQueue 
                  songs={songQueue}
                  onRemove={handleRemoveFromQueue}
                  onPlay={handlePlaySong}
                  isHost={isHost}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: '100%', backgroundColor: 'background.paper' }}>
                  <Typography variant="h6" gutterBottom>
                    Músicas Disponíveis
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar músicas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ overflow: 'auto', maxHeight: 'calc(100% - 100px)' }}>
                    <SongList 
                      onAddToQueue={handleAddToQueue}
                      searchTerm={searchTerm}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4} sx={{ height: '100%' }}>
          <Grid container spacing={2} direction="column">
            <Grid item sx={{ display: { xs: 'none', md: 'block' } }}>
              <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  ID da Sessão: {sessionId}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-all' }}>
                  URL: {sessionUrl}
                </Typography>
                <QRCodeCanvas value={sessionUrl} size={200} level="H" />
              </Paper>
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}>
              <ParticipantsList users={users} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Session;
