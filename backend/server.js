const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const songsRouter = require('./routes/songs');

const app = express();
const server = http.createServer(app);

// Configure CORS to accept connections from any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type']
}));

// Configure Socket.IO to accept connections from any origin
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  }
});

app.use(express.json());
app.use('/api/songs', songsRouter);

// Store active sessions
const sessions = new Map();

// Generate a 4-digit session ID
function generateSessionId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Get local IP address for QR code
function getLocalIpAddress() {
  return '192.168.101.246';
}

// Create a new session
app.post('/api/sessions', async (req, res) => {
  try {
    const sessionId = generateSessionId();
    const localIp = getLocalIpAddress();
    console.log('Creating QR code with URL:', `http://${localIp}:3000/setup/${sessionId}`);
    const qrCode = await QRCode.toDataURL(`http://${localIp}:3000/setup/${sessionId}`);
    
    sessions.set(sessionId, {
      id: sessionId,
      qrCode,
      users: [],
      currentSong: null,
      songQueue: [],
      createdAt: new Date()
    });

    console.log('Session created:', sessionId);
    res.json({ sessionId, qrCode });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Join existing session
app.get('/api/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Looking for session:', sessionId);
    const session = sessions.get(sessionId);

    if (!session) {
      console.log('Session not found:', sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log('Session found:', sessionId);
    res.json(session);
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinSession', ({ sessionId, user }) => {
    try {
      console.log(`Attempting to join session ${sessionId} for user:`, user);
      const session = sessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found`);
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // Add socket to session room
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room ${sessionId}`);

      // Add or update user in session
      const userWithSocket = { ...user, socketId: socket.id };
      const existingUserIndex = session.users.findIndex(u => u.id === user.id);
      
      if (existingUserIndex >= 0) {
        console.log(`Updating existing user ${user.name} in session ${sessionId}`);
        session.users[existingUserIndex] = userWithSocket;
      } else {
        console.log(`Adding new user ${user.name} to session ${sessionId}`);
        session.users.push(userWithSocket);
      }

      // Send current state to the new user
      socket.emit('currentSong', session.currentSong);
      socket.emit('songQueue', session.songQueue);

      // Notify all clients in the session about the updated user list
      console.log(`Broadcasting updated user list to session ${sessionId}:`, session.users);
      io.to(sessionId).emit('userList', session.users);

      console.log(`User ${user.name} successfully joined session ${sessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });

  socket.on('disconnect', () => {
    try {
      console.log(`Client disconnected: ${socket.id}`);
      // Find the session this socket was in
      for (const [sessionId, session] of sessions.entries()) {
        const userIndex = session.users.findIndex(u => u.socketId === socket.id);
        if (userIndex >= 0) {
          const user = session.users[userIndex];
          console.log(`Removing user ${user.name} from session ${sessionId}`);
          // Remove the user
          session.users.splice(userIndex, 1);
          // Notify remaining users
          console.log(`Broadcasting updated user list after disconnect:`, session.users);
          io.to(sessionId).emit('userList', session.users);
          console.log(`User ${user.name} successfully removed from session ${sessionId}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Handle song queue events
  socket.on('addToQueue', ({ sessionId, song }) => {
    try {
      console.log(`Adding song to queue in session ${sessionId}:`, song);
      const session = sessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found`);
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      if (!session.songQueue) {
        session.songQueue = [];
      }

      session.songQueue.push(song);
      console.log(`Updated song queue for session ${sessionId}:`, session.songQueue);
      io.to(sessionId).emit('songQueue', session.songQueue);
    } catch (error) {
      console.error('Error adding song to queue:', error);
      socket.emit('error', { message: 'Failed to add song to queue' });
    }
  });

  socket.on('removeFromQueue', ({ sessionId, index }) => {
    try {
      console.log(`Removing song at index ${index} from session ${sessionId}`);
      const session = sessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found`);
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      if (!session.songQueue) {
        session.songQueue = [];
        return;
      }

      if (index >= 0 && index < session.songQueue.length) {
        const removedSong = session.songQueue.splice(index, 1)[0];
        console.log(`Removed song from queue:`, removedSong);
        console.log(`Updated song queue:`, session.songQueue);
        io.to(sessionId).emit('songQueue', session.songQueue);
      }
    } catch (error) {
      console.error('Error removing song from queue:', error);
      socket.emit('error', { message: 'Failed to remove song from queue' });
    }
  });

  socket.on('playSong', ({ sessionId, song }) => {
    try {
      console.log(`Playing song in session ${sessionId}:`, song);
      const session = sessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found`);
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.currentSong = {
        ...song,
        startTime: Date.now()
      };
      
      console.log(`Updated current song for session ${sessionId}:`, session.currentSong);
      io.to(sessionId).emit('currentSong', session.currentSong);
    } catch (error) {
      console.error('Error playing song:', error);
      socket.emit('error', { message: 'Failed to play song' });
    }
  });

  socket.on('reorderQueue', ({ sessionId, sourceIndex, destinationIndex }) => {
    try {
      console.log(`Reordering queue in session ${sessionId} from ${sourceIndex} to ${destinationIndex}`);
      const session = sessions.get(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} not found`);
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      if (!session.songQueue) {
        session.songQueue = [];
        return;
      }

      // Verifica se os índices são válidos
      if (sourceIndex >= 0 && sourceIndex < session.songQueue.length &&
          destinationIndex >= 0 && destinationIndex < session.songQueue.length) {
        // Remove a música da posição original e a insere na nova posição
        const [movedSong] = session.songQueue.splice(sourceIndex, 1);
        session.songQueue.splice(destinationIndex, 0, movedSong);
        
        console.log(`Updated song queue after reorder:`, session.songQueue);
        // Emite a fila atualizada para todos os clientes na sessão
        io.to(sessionId).emit('songQueue', session.songQueue);
      } else {
        console.error(`Invalid indices for reorder: source=${sourceIndex}, destination=${destinationIndex}`);
        socket.emit('error', { message: 'Invalid indices for reorder' });
      }
    } catch (error) {
      console.error('Error reordering queue:', error);
      socket.emit('error', { message: 'Failed to reorder queue' });
    }
  });

  socket.on('requestQueueUpdate', ({ sessionId }) => {
    try {
      const session = sessions.get(sessionId);
      if (session) {
        socket.emit('songQueue', session.songQueue || []);
      }
    } catch (error) {
      console.error('Error sending queue update:', error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIpAddress();
  console.log(`Server running on port ${PORT}`);
  console.log(`Local IP: ${localIp}`);
  console.log(`Access the app at: http://${localIp}:3000`);
});
