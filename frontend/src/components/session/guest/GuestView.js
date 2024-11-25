import React, { useState, useEffect } from 'react';
import { 
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery
} from '@mui/material';
import CurrentSong from './components/CurrentSong';
import ParticipantsList from './components/ParticipantsList';
import QueueList from './components/QueueList';
import SearchSongs from './components/SearchSongs';
import MobileNavBar from './components/MobileNavBar';

// Criando um tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#6D28D9', // Roxo
      light: '#8B5CF6',
      dark: '#5B21B6',
    },
    secondary: {
      main: '#EC4899', // Rosa
      light: '#F472B6',
      dark: '#DB2777',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

function GuestView({ socket, sessionId, currentSong, participants }) {
  const [queue, setQueue] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState('queue');

  useEffect(() => {
    if (socket) {
      socket.on('queueUpdate', (updatedQueue) => {
        setQueue(updatedQueue);
      });

      socket.emit('getQueue', { sessionId });

      return () => {
        socket.off('queueUpdate');
      };
    }
  }, [socket, sessionId]);

  const renderMainContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h2" gutterBottom>
            Tocando Agora
          </Typography>
          <CurrentSong currentSong={currentSong} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h2" gutterBottom>
            Próximas Músicas
          </Typography>
          <QueueList queue={queue} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography variant="h2" gutterBottom>
            Adicionar Música
          </Typography>
          <SearchSongs socket={socket} sessionId={sessionId} />
        </Paper>
      </Grid>
    </Grid>
  );

  const renderParticipants = () => (
    <Paper elevation={0} sx={{ p: 3, position: 'sticky', top: 24 }}>
      <Typography variant="h2" gutterBottom>
        Participantes Online
      </Typography>
      <ParticipantsList participants={participants} />
    </Paper>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: isMobile ? 8 : 3,
        pt: 3
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Conteúdo Principal */}
            <Grid item xs={12} lg={9}>
              {renderMainContent()}
            </Grid>

            {/* Barra Lateral */}
            <Grid item xs={12} lg={3}>
              {renderParticipants()}
            </Grid>
          </Grid>
        </Container>

        {isMobile && (
          <MobileNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default GuestView;
