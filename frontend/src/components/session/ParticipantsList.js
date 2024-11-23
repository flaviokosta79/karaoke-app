import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

function ParticipantsList({ users = [] }) {
  return (
    <Paper elevation={3} sx={{ height: '100%', backgroundColor: 'background.paper' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Participantes ({users.length})
      </Typography>
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100% - 56px)' }}>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemAvatar>
              <Avatar>
                {user.name ? user.name[0].toUpperCase() : <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={user.name}
              secondary={user.isHost ? 'Anfitrião' : 'Participante'}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default ParticipantsList;
