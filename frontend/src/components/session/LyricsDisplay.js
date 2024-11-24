import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

function LyricsDisplay({ currentLyric, nextLyric, progress = 0 }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '120px',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 2,
        p: 2,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
      }}
    >
      {/* Current Lyric with Progress Highlight */}
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Typography
          variant="h3"
          sx={{
            color: 'rgba(255,255,255,0.3)',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontWeight: 'bold',
            mb: 1,
            position: 'relative',
          }}
        >
          {currentLyric}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${progress}%`,
              height: '100%',
              overflow: 'hidden',
              color: theme.palette.primary.main,
              whiteSpace: 'nowrap',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                position: 'absolute',
                left: 0,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {currentLyric}
            </Typography>
          </Box>
        </Typography>
      </Box>

      {/* Next Lyric */}
      <Typography
        variant="h5"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          mt: 2
        }}
      >
        {nextLyric}
      </Typography>

      {/* Background Glow Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
    </Box>
  );
}

export default LyricsDisplay;
