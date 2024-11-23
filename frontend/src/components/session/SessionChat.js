import React, { useState } from 'react';
import {
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

function SessionChat() {
  const [message, setMessage] = useState('');
  
  // Mock data - will be replaced with real data later
  const messages = [
    { id: 1, user: 'Usuário 1', text: 'Olá, pessoal!', timestamp: '10:00' },
    { id: 2, user: 'Usuário 2', text: 'Oi! Vamos cantar?', timestamp: '10:01' },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Will be implemented with Socket.IO
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', backgroundColor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        Chat
      </Typography>
      
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((msg) => (
          <ListItem key={msg.id}>
            <ListItemText
              primary={msg.user}
              secondary={msg.text}
              secondaryTypographyProps={{
                sx: { color: 'text.primary', mt: 0.5 }
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {msg.timestamp}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" edge="end">
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
}

export default SessionChat;
