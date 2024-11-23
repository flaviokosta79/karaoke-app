import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import QrReader from 'react-qr-scanner';
import { config } from '../config';

function Home() {
  const navigate = useNavigate();
  const [openQrScanner, setOpenQrScanner] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Clear any existing user data when landing on home page
  localStorage.removeItem('userData');

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const createSession = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Creating session with backend URL:', config.backendUrl);
      const response = await fetch(`${config.backendUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      
      if (!data.sessionId) {
        throw new Error('Invalid response from server');
      }
      
      // Store session ID temporarily
      localStorage.setItem('tempSessionId', data.sessionId);
      
      // Navigate to user setup first
      navigate('/setup');
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error.message || 'Failed to create session. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async () => {
    if (!sessionId.trim()) {
      const errorMessage = 'Please enter a session ID';
      setError(errorMessage);
      showSnackbar(errorMessage);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Verify session exists
      const response = await fetch(`${config.backendUrl}/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Session not found');
      }

      // Navigate to user setup with session ID
      navigate(`/setup/${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      const errorMessage = error.message || 'Failed to join session. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage);
      setIsLoading(false);
    }
  };

  const handleQrScan = (data) => {
    if (data) {
      try {
        // Extract session ID from QR code URL
        const url = new URL(data.text);
        const pathSegments = url.pathname.split('/');
        const scannedSessionId = pathSegments[pathSegments.length - 1];
        
        setOpenQrScanner(false);
        navigate(`/setup/${scannedSessionId}`);
      } catch (error) {
        console.error('Error parsing QR code:', error);
        const errorMessage = 'Invalid QR code';
        setError(errorMessage);
        showSnackbar(errorMessage);
      }
    }
  };

  const handleQrError = (err) => {
    console.error('QR Scanner error:', err);
    const errorMessage = 'Failed to scan QR code';
    setError(errorMessage);
    showSnackbar(errorMessage);
  };

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
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Karaoke Party 🎤
        </Typography>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={createSession}
            disabled={isLoading}
            sx={{ py: 2 }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Creating Session...</span>
              </Box>
            ) : (
              'Create New Session'
            )}
          </Button>

          <Typography variant="h6" align="center" sx={{ mt: 4, mb: 2 }}>
            or join existing session
          </Typography>

          <TextField
            fullWidth
            label="Session ID"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            error={!!error && !sessionId.trim()}
            helperText={!sessionId.trim() && error}
            disabled={isLoading}
            sx={{ mb: 2 }}
          />

          <Button
            variant="outlined"
            size="large"
            onClick={joinSession}
            disabled={isLoading}
            sx={{ py: 2 }}
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

          <Button
            variant="text"
            onClick={() => setOpenQrScanner(true)}
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            Scan QR Code
          </Button>
        </Box>

        <Dialog 
          open={openQrScanner} 
          onClose={() => setOpenQrScanner(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Scan Session QR Code</DialogTitle>
          <DialogContent>
            <QrReader
              delay={300}
              onError={handleQrError}
              onScan={handleQrScan}
              style={{ width: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenQrScanner(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Home;
