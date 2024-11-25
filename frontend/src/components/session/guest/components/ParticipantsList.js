import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Card,
  Badge,
  useTheme
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

function ParticipantsList({ participants = [] }) {
  const theme = useTheme();

  if (!participants || participants.length === 0) {
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
          <PersonIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
          <Typography variant="body1">
            Nenhum participante online
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <List sx={{ mx: -2 }}>
      {participants.map((participant, index) => (
        <ListItem
          key={index}
          sx={{
            px: 2,
            borderRadius: 2,
            mb: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemAvatar>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: '#44b700',
                  color: '#44b700',
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                  '&::after': {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    animation: 'ripple 1.2s infinite ease-in-out',
                    border: '1px solid currentColor',
                    content: '""',
                  },
                },
                '@keyframes ripple': {
                  '0%': {
                    transform: 'scale(.8)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'scale(2.4)',
                    opacity: 0,
                  },
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                }}
              >
                {participant.name ? participant.name[0].toUpperCase() : <PersonIcon />}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body1" noWrap>
                {participant.name || 'Anônimo'}
              </Typography>
            }
            secondary={
              participant.role && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {participant.role}
                </Typography>
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default ParticipantsList;
