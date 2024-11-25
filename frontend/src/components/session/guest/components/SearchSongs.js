import React, { useState } from 'react';
import { 
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  InputAdornment,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function SearchSongs({ socket, sessionId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requestedSongs, setRequestedSongs] = useState(new Set());

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/songs/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = (song) => {
    if (requestedSongs.has(song.id)) return;
    
    socket.emit('requestSong', { sessionId, song });
    setRequestedSongs(new Set([...requestedSongs, song.id]));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TextField
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Digite o nome da música ou artista..."
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && searchResults.length > 0 && (
        <Grid container spacing={2}>
          {searchResults.map((song) => (
            <Grid item xs={12} sm={6} md={4} key={song.id}>
              <Card variant="outlined" sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 2
                }
              }}>
                <CardContent sx={{ 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography variant="h6" component="h3" noWrap>
                      {song.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {song.artist}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => handleRequest(song)}
                    disabled={requestedSongs.has(song.id)}
                    variant="contained"
                    color={requestedSongs.has(song.id) ? "success" : "primary"}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {requestedSongs.has(song.id) ? 'Adicionada' : 'Adicionar'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!isLoading && searchTerm.length >= 2 && searchResults.length === 0 && (
        <Box sx={{ 
          textAlign: 'center',
          py: 4,
          color: 'text.secondary'
        }}>
          <Typography variant="body1">
            Nenhuma música encontrada
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default SearchSongs;
