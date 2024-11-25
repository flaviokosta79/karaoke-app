import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import { MusicNote as MusicIcon } from '@mui/icons-material';

function QueueList({ queue }) {
  const theme = useTheme();

  if (!queue || queue.length === 0) {
    return (
      <Card 
        variant="outlined"
        sx={{
          bgcolor: 'background.default',
          borderStyle: 'dashed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          minHeight: 140
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
          <MusicIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1">
            Nenhuma música na fila
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        overflowX: 'auto',
        pb: 2,
        px: 0.5,
        mx: -0.5,
        '&::-webkit-scrollbar': {
          height: 8,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.main,
          borderRadius: 4,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        },
      }}
    >
      {queue.map((song, index) => (
        <Card
          key={index}
          sx={{
            minWidth: 280,
            maxWidth: 280,
            flexShrink: 0,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                  fontSize: '1rem',
                  mr: 2
                }}
              >
                {index + 1}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}
                  noWrap
                >
                  {song.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                  noWrap
                >
                  {song.artist}
                </Typography>
              </Box>
            </Box>
            
            <Chip
              label={`Pedido por ${song.requestedBy || 'Anônimo'}`}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

export default QueueList;
