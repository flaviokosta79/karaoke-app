import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { QueueMusic, Search } from '@mui/icons-material';
import { config } from '../config';

function SongList({ onAddToQueue }) {
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [searchQuery, songs]);

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/songs`);
      const data = await response.json();
      setSongs(data);
      setFilteredSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const filterSongs = () => {
    const filtered = songs.filter(
      song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
  };

  return (
    <Paper sx={{ p: 2, maxHeight: '70vh', overflow: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      <List>
        {filteredSongs.map((song) => (
          <ListItem key={song.id} divider>
            <ListItemText
              primary={song.title}
              secondary={
                <>
                  <Typography component="span" variant="body2" color="text.primary">
                    {song.artist}
                  </Typography>
                  {' — '}{song.duration}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="add to queue"
                onClick={() => onAddToQueue(song)}
              >
                <QueueMusic />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default SongList;
