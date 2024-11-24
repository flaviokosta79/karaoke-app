import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import YouTubeIcon from '@mui/icons-material/YouTube';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { config } from '../../config';

function SongList({ onAddToQueue, isHost }) {
  const [songs, setSongs] = useState([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/songs`);
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
      showSnackbar('Error loading songs', 'error');
    }
  };

  const handleAddYouTube = async () => {
    try {
      setLoading(true);
      setError('');

      if (youtubeUrl.includes('playlist')) {
        // É uma playlist
        const response = await fetch(`${config.backendUrl}/api/songs/youtube/playlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playlistUrl: youtubeUrl }),
        });

        const videos = await response.json();
        if (videos.error) {
          throw new Error(videos.error);
        }

        // Adicionar todos os vídeos à fila
        videos.forEach(video => onAddToQueue(video));
        showSnackbar(`Added ${videos.length} songs from playlist`, 'success');
      } else {
        // É um vídeo único
        const videoId = extractVideoId(youtubeUrl);
        if (!videoId) {
          throw new Error('Invalid YouTube URL');
        }

        const response = await fetch(`${config.backendUrl}/api/songs/youtube/${videoId}`);
        const videoInfo = await response.json();

        onAddToQueue(videoInfo);
        showSnackbar('Song added to queue', 'success');
      }

      setYoutubeUrl('');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding YouTube video:', error);
      setError(error.message || 'Failed to add YouTube video');
      showSnackbar('Error adding video', 'error');
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<MusicNoteIcon />} label="Local Songs" />
        <Tab icon={<YouTubeIcon />} label="Add YouTube" disabled={!isHost} />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {tabValue === 0 ? (
          // Local Songs List
          <List>
            {songs.map((song) => (
              <ListItem
                key={song.id}
                divider
                secondaryAction={
                  isHost && (
                    <IconButton
                      edge="end"
                      aria-label="add to queue"
                      onClick={() => {
                        onAddToQueue(song);
                        showSnackbar('Song added to queue', 'success');
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar src={song.thumbnailUrl ? `${config.backendUrl}${song.thumbnailUrl}` : null}>
                    <MusicNoteIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={song.title}
                  secondary={song.artist}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          // YouTube Input
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add YouTube Video or Playlist
            </Typography>
            <TextField
              fullWidth
              label="YouTube URL"
              variant="outlined"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<YouTubeIcon />}
                onClick={handleAddYouTube}
                disabled={!youtubeUrl || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Add to Queue'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default SongList;
