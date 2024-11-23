import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
} from '@mui/material';
import { QueueMusic } from '@mui/icons-material';
import { config } from '../config';

function SongList({ onAddToQueue, searchTerm = '' }) {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [searchTerm, songs]);

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
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSongs(filtered);
  };

  return (
    <List sx={{ overflow: 'auto' }}>
      {filteredSongs.length === 0 ? (
        <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          Nenhuma música encontrada
        </Typography>
      ) : (
        filteredSongs.map((song) => (
          <ListItem key={song.id} divider>
            <ListItemText
              primary={song.title}
              secondary={song.artist}
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
        ))
      )}
    </List>
  );
}

export default SongList;
