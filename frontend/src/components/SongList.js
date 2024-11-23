import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Stack,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  QueueMusic,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { config } from '../config';

function SongList({ onAddToQueue, onPlay, searchTerm = '', isHost }) {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          <ListItem
            key={song.id}
            divider
            sx={{
              py: isMobile ? 2 : 1,
              position: 'relative',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              '&:active': {
                backgroundColor: theme => theme.palette.action.selected,
              },
            }}
          >
            <Box 
              onClick={() => onAddToQueue(song)}
              sx={{ 
                flex: 1,
                width: '100%',
                cursor: 'pointer',
                pr: isMobile ? 0 : 10,
                mb: isMobile ? 2 : 0,
                '&:active': {
                  opacity: 0.7,
                },
              }}
            >
              <ListItemText
                primary={song.title}
                secondary={song.artist}
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: 500,
                    fontSize: isMobile ? '1.1rem' : 'inherit'
                  }
                }}
                secondaryTypographyProps={{
                  sx: { 
                    fontSize: isMobile ? '0.9rem' : 'inherit'
                  }
                }}
              />
            </Box>
            <Box
              sx={{
                position: isMobile ? 'relative' : 'absolute',
                right: isMobile ? 0 : 8,
                width: isMobile ? '100%' : 'auto',
                display: 'flex',
                justifyContent: isMobile ? 'space-between' : 'flex-end',
                mt: isMobile ? 1 : 0
              }}
            >
              <Stack 
                direction="row" 
                spacing={2}
                sx={{
                  width: isMobile ? '100%' : 'auto',
                  '& .MuiIconButton-root': {
                    flex: isMobile ? 1 : 'none',
                    height: isMobile ? 44 : 40,
                  }
                }}
              >
                {isHost && (
                  <IconButton
                    edge="end"
                    aria-label="play now"
                    onClick={() => onPlay(song)}
                    color="primary"
                    sx={{
                      backgroundColor: theme => theme.palette.primary.main + '1A',
                    }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                )}
                <IconButton
                  edge="end"
                  aria-label="add to queue"
                  onClick={() => onAddToQueue(song)}
                  sx={{
                    backgroundColor: theme => theme.palette.action.hover,
                  }}
                >
                  <QueueMusic />
                </IconButton>
              </Stack>
            </Box>
          </ListItem>
        ))
      )}
    </List>
  );
}

export default SongList;
