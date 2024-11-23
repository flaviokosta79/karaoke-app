import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';

function SongQueue({ songs = [], onRemove, onPlay, isHost }) {
  return (
    <Paper elevation={3} sx={{ height: '100%', backgroundColor: 'background.paper' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Fila de Músicas
      </Typography>
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 56px)' }}>
        {songs.map((song, index) => (
          <React.Fragment key={song.id}>
            <ListItem>
              <ListItemText
                primary={song.title}
                secondary={`${song.artist} • ${song.user}`}
                primaryTypographyProps={{
                  sx: { display: 'flex', alignItems: 'center' }
                }}
                secondaryTypographyProps={{
                  sx: { color: 'text.secondary' }
                }}
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => onRemove(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < songs.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {songs.length === 0 && (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            Nenhuma música na fila
          </Typography>
        )}
      </List>
    </Paper>
  );
}

export default SongQueue;
