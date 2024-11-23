import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { PlayArrow, Delete } from '@mui/icons-material';

function SongQueue({ songs = [], onRemove, onPlay, isHost }) {
  if (!songs || songs.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No songs in queue
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {songs.map((song, index) => (
        <ListItem key={song.id}>
          <ListItemText
            primary={song.title}
            secondary={song.artist}
          />
          <ListItemSecondaryAction>
            {isHost && (
              <>
                <IconButton
                  edge="end"
                  aria-label="play"
                  onClick={() => onPlay?.(song, index)}
                  sx={{ mr: 1 }}
                >
                  <PlayArrow />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onRemove?.(song.id)}
                >
                  <Delete />
                </IconButton>
              </>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}

export default SongQueue;
