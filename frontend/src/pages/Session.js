import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  useTheme,
  useMediaQuery,
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
  const [currentUser, setCurrentUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sessionUrl = `${window.location.origin}/setup/${sessionId}`;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      setError('User data not found');
      return;
    }

    setIsHost(userData.isHost);
    setCurrentUser(userData.name);

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
      // Garantir que cada música tenha um ID string
      const queueWithStringIds = (updatedQueue || []).map(song => ({
        ...song,
        id: song.id.toString()
      }));
      setSongQueue(queueWithStringIds);
    });

    newSocket.on('currentSong', (song) => {
      console.log('Current song updated:', song);
      setCurrentSong(song);
    });

    newSocket.on('queueUpdated', (updatedQueue) => {
      console.log('Received queue update:', updatedQueue);
      setSongQueue(updatedQueue);
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
          // Garantir que cada música tenha um ID string
          const queueWithStringIds = (data.songQueue || []).map(song => ({
            ...song,
            id: song.id.toString()
          }));
          setSongQueue(queueWithStringIds);
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
      const songWithUser = {
        ...song,
        user: currentUser
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
      const song = songQueue[index];
      if (isHost || song.user === currentUser) {
        console.log('Removing song at index:', index);
        socket.emit('removeFromQueue', {
          sessionId,
          index
        });
      } else {
        console.error('User does not have permission to remove this song');
      }
    } catch (error) {
      console.error('Error removing from queue:', error);
      setError('Failed to remove song from queue');
    }
  };

  const handleReorderQueue = (sourceIndex, destinationIndex) => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    try {
      const sourceMusic = songQueue[sourceIndex];
      if (isHost || sourceMusic.user === currentUser) {
        // Atualiza o estado local imediatamente
        const newQueue = Array.from(songQueue);
        const [removed] = newQueue.splice(sourceIndex, 1);
        newQueue.splice(destinationIndex, 0, removed);
        setSongQueue(newQueue);

        // Envia a atualização para o servidor
        console.log('Reordering queue from index', sourceIndex, 'to', destinationIndex);
        socket.emit('reorderQueue', {
          sessionId,
          sourceIndex,
          destinationIndex
        });
      } else {
        console.error('User does not have permission to move this song');
      }
    } catch (error) {
      console.error('Error reordering queue:', error);
      setError('Failed to reorder song queue');
      // Em caso de erro, reverte para a ordem original
      socket.emit('requestQueueUpdate', { sessionId });
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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={2} sx={{ height: '100vh', p: 2 }}>
      {/* Player Area */}
      <Grid item xs={12} md={8}>
        {isHost ? (
          <KaraokePlayer
            song={currentSong}
            isHost={isHost}
          />
        ) : (
          <Box sx={{ 
            height: 100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="h6" color="text.secondary">
              {currentSong ? `Tocando: ${currentSong.title} - ${currentSong.artist}` : 'Aguardando música...'}
            </Typography>
          </Box>
        )}

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar músicas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Main Content Area */}
        <Grid container spacing={2}>
          {/* Song Queue and Participants List */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              height: isMobile ? 'auto' : 'calc(100vh - 250px)',
            }}>
              {/* Song Queue */}
              <Box sx={{ 
                flex: isMobile ? 'none' : 2,
                minHeight: isMobile ? 300 : 0
              }}>
                <SongQueue
                  songs={songQueue}
                  onRemove={handleRemoveFromQueue}
                  onReorder={handleReorderQueue}
                  onPlay={handlePlaySong}
                  isHost={isHost}
                  currentUser={currentUser}
                />
              </Box>
            </Box>
          </Grid>

          {/* Song List */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              height: isMobile ? 400 : 'calc(100vh - 250px)',
              overflow: 'auto'
            }}>
              <SongList
                onAddToQueue={handleAddToQueue}
                onPlay={handlePlaySong}
                searchTerm={searchTerm}
                isHost={isHost}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      {/* QR Code Area - Only show for host on desktop */}
      {!isMobile && isHost && (
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* QR Code */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2 }}>
                ID da Sessão: {sessionId}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <QRCodeCanvas value={sessionUrl} size={200} />
              </Box>
              <Typography align="center" sx={{ wordBreak: 'break-all' }}>
                {sessionUrl}
              </Typography>
            </Paper>

            {/* Participants List for Desktop */}
            <Paper sx={{ p: 2, flex: 1 }}>
              <ParticipantsList
                users={users}
                currentUser={currentUser}
                isHost={isHost}
              />
            </Paper>
          </Box>
        </Grid>
      )}

      {/* Participants List for non-host or mobile */}
      {(!isHost || isMobile) && (
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <ParticipantsList
              users={users}
              currentUser={currentUser}
              isHost={isHost}
            />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}

export default Session;
