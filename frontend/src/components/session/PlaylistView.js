import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  ListItemSecondaryAction,
  Avatar, 
  IconButton, 
  Typography,
  Box,
  Divider,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function PlaylistView({ songs, currentSong, onRemove, onSelect }) {
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      {/* Current Song */}
      {currentSong && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
            NOW PLAYING
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'rgba(255,255,255,0.05)',
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              {currentSong.type === 'youtube' ? (
                <YouTubeIcon color="error" />
              ) : (
                <MusicNoteIcon color="primary" />
              )}
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {currentSong.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="rgba(255,255,255,0.7)">
              {currentSong.artist}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Up Next */}
      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
        UP NEXT
      </Typography>

      <List sx={{ 
        bgcolor: 'transparent',
        '& .MuiListItem-root': {
          borderRadius: 1,
          mb: 1,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.05)'
          }
        }
      }}>
        {songs.map((song, index) => (
          <React.Fragment key={song.id}>
            <ListItem 
              button 
              onClick={() => onSelect(song)}
              selected={currentSong?.id === song.id}
              sx={{
                bgcolor: currentSong?.id === song.id ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              <ListItemAvatar>
                {song.thumbnailUrl ? (
                  <Avatar src={song.thumbnailUrl} variant="rounded" />
                ) : (
                  <Avatar variant="rounded">
                    {song.type === 'youtube' ? (
                      <YouTubeIcon />
                    ) : (
                      <MusicNoteIcon />
                    )}
                  </Avatar>
                )}
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {song.title}
                    </Typography>
                    {song.singer && (
                      <Chip
                        icon={<MicIcon sx={{ fontSize: 16 }} />}
                        label={song.singer}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          height: 24
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      color="rgba(255,255,255,0.5)"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <AccessTimeIcon sx={{ fontSize: 16 }} />
                      {formatDuration(song.duration)}
                    </Typography>
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  onClick={() => onRemove(song)}
                  sx={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < songs.length - 1 && (
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            )}
          </React.Fragment>
        ))}
      </List>

      {songs.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 4,
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          <MusicNoteIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography>
            No songs in queue
          </Typography>
          <Typography variant="body2">
            Add songs to get the party started!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default PlaylistView;
