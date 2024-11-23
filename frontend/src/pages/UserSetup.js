import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { config } from '../config';

const avatars = [
  '/avatars/1.png',
  '/avatars/2.png',
  '/avatars/3.png',
  '/avatars/4.png',
  '/avatars/5.png',
  '/avatars/6.png',
  '/avatars/7.png',
  '/avatars/8.png',
];

function UserSetup() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const setup = async () => {
      // If we have a sessionId in URL, verify it exists
      if (urlSessionId) {
        setIsLoading(true);
        try {
          const response = await fetch(`${config.backendUrl}/api/sessions/${urlSessionId}`);
          if (!response.ok) {
            throw new Error('Session not found');
          }
          setSessionId(urlSessionId);
          setIsHost(false);
        } catch (error) {
          console.error('Error verifying session:', error);
          setError('Invalid session. Please try again.');
          navigate('/');
          return;
        } finally {
          setIsLoading(false);
        }
      } else {
        // No sessionId in URL means we're creating a new session
        const tempSessionId = localStorage.getItem('tempSessionId');
        if (!tempSessionId) {
          // No temporary session ID means we shouldn't be here
          navigate('/');
          return;
        }
        setSessionId(tempSessionId);
        setIsHost(true);
      }
    };

    setup();
  }, [urlSessionId, navigate]);

  const generateUserId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!selectedAvatar) {
      setError('Please select an avatar');
      return;
    }
    if (!sessionId) {
      setError('Session ID not found');
      navigate('/');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store user data in localStorage for persistence
      const userData = {
        id: generateUserId(),
        name: name.trim(),
        avatar: selectedAvatar,
        isHost,
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Navigate to session
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to join session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <CircularProgress />
          <Typography>Loading session...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Set Up Your Profile
        </Typography>

        <Typography color="textSecondary" gutterBottom>
          {isHost ? 'You will be the host of this session' : 'You are joining as a participant'}
        </Typography>

        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error && !name.trim()}
          helperText={!name.trim() ? error : ''}
          disabled={isLoading}
          sx={{ mb: 4 }}
        />

        <Typography variant="h6" component="h2" gutterBottom>
          Choose Your Avatar
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          {avatars.map((avatar, index) => (
            <Grid item key={index}>
              <Avatar
                src={avatar}
                sx={{
                  width: 80,
                  height: 80,
                  cursor: 'pointer',
                  border: selectedAvatar === avatar ? '3px solid #2196f3' : 'none',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
                onClick={() => setSelectedAvatar(avatar)}
              />
            </Grid>
          ))}
        </Grid>

        {!!error && !selectedAvatar && (
          <Typography color="error">{error}</Typography>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ mt: 4 }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} color="inherit" />
              <span>Joining Session...</span>
            </Box>
          ) : (
            'Join Session'
          )}
        </Button>
      </Box>
    </Container>
  );
}

export default UserSetup;
