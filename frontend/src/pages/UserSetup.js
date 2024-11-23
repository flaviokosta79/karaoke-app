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

const avatarOptions = [
  { color: '#1976d2', image: '/avatars/1.png' }, // Azul
  { color: '#2e7d32', image: '/avatars/2.png' }, // Verde
  { color: '#d32f2f', image: '/avatars/3.png' }, // Vermelho
  { color: '#ed6c02', image: '/avatars/4.png' }, // Laranja
  { color: '#9c27b0', image: '/avatars/5.png' }, // Roxo
  { color: '#0288d1', image: '/avatars/6.png' }, // Azul claro
  { color: '#689f38', image: '/avatars/7.png' }, // Verde claro
  { color: '#7b1fa2', image: '/avatars/8.png' }, // Roxo escuro
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
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
              {isHost ? 'Create Your Profile' : 'Join Session'}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Your Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!error}
                helperText={error}
              />
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Choose your avatar:
              </Typography>
              <Grid container spacing={2}>
                {avatarOptions.map((avatar) => (
                  <Grid item key={avatar.image} xs={3}>
                    <Avatar
                      src={avatar.image}
                      alt="Avatar option"
                      sx={{
                        width: 56,
                        height: 56,
                        cursor: 'pointer',
                        border: selectedAvatar === avatar.image ? 3 : 0,
                        borderColor: avatar.color,
                        bgcolor: avatar.color,
                        '&:hover': {
                          opacity: 0.8,
                        },
                      }}
                      onClick={() => setSelectedAvatar(avatar.image)}
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isHost ? 'Create Session' : 'Join Session'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

export default UserSetup;
