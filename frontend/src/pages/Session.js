import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grid,
} from '@mui/material';
import { io } from 'socket.io-client';
import SongList from '../components/SongList';
import SongQueue from '../components/SongQueue';
import KaraokePlayer from '../components/KaraokePlayer';
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
      console.log('Adding song to queue:', song);
      socket.emit('addToQueue', {
        sessionId,
        song
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
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Session: {sessionId}
          </Typography>
        </Grid>

        {/* Karaoke Player */}
        <Grid item xs={12}>
          <KaraokePlayer
            song={currentSong}
            socket={socket}
            sessionId={sessionId}
            isHost={isHost}
          />
        </Grid>

        {/* Connected Users */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Connected Users ({users.length})
            </Typography>
            <List>
              {users.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar>{user.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.isHost ? 'Host' : 'Participant'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Song Queue */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Song Queue ({songQueue.length})
            </Typography>
            <SongQueue
              songs={songQueue}
              onRemove={handleRemoveFromQueue}
              onPlay={handlePlaySong}
              isHost={isHost}
            />
          </Paper>
        </Grid>

        {/* Song List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Songs
            </Typography>
            <SongList onAddToQueue={handleAddToQueue} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Session;
