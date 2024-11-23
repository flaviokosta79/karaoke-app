import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

const avatarColors = {
  '/avatars/1.png': '#1976d2', // Azul
  '/avatars/2.png': '#2e7d32', // Verde
  '/avatars/3.png': '#d32f2f', // Vermelho
  '/avatars/4.png': '#ed6c02', // Laranja
  '/avatars/5.png': '#9c27b0', // Roxo
  '/avatars/6.png': '#0288d1', // Azul claro
  '/avatars/7.png': '#689f38', // Verde claro
  '/avatars/8.png': '#7b1fa2', // Roxo escuro
};

function ParticipantsList({ users = [], currentUser }) {
  return (
    <Paper elevation={3} sx={{ height: '100%', backgroundColor: 'background.paper' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Participantes ({users.length})
      </Typography>
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 56px)' }}>
        {users.map((user) => {
          const isCurrentUser = user.name === currentUser;
          const userColor = avatarColors[user.avatar] || '#1976d2'; // Cor padrão se não encontrar
          
          return (
            <ListItem 
              key={user.id}
              sx={{
                bgcolor: isCurrentUser ? theme => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: isCurrentUser ? theme => alpha(theme.palette.primary.main, 0.12) : 'action.hover',
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={user.avatar}
                  sx={{
                    bgcolor: userColor,
                    color: 'white',
                  }}
                >
                  {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Box 
                    component="span"
                    sx={{ 
                      color: isCurrentUser ? 'primary.main' : 'text.primary',
                      fontWeight: isCurrentUser ? 600 : 400,
                    }}
                  >
                    {user.name}
                  </Box>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: user.isHost ? 'primary.main' : 'text.secondary',
                      fontWeight: user.isHost ? 500 : 400
                    }}
                  >
                    {user.isHost ? 'Anfitrião' : 'Participante'}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}

export default ParticipantsList;
