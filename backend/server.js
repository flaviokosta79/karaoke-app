const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const youtubeService = require('./services/youtubeService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Armazenamento em memória das sessões
const sessions = new Map();

// Função para gerar ID numérico de 4 dígitos
function generateSessionId() {
  const min = 1000;
  const max = 9999;
  let sessionId;
  do {
    sessionId = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (sessions.has(sessionId.toString()));
  return sessionId.toString();
}

// Rotas da API
app.post('/api/sessions', async (req, res) => {
  try {
    const sessionId = generateSessionId();
    console.log('Criando nova sessão:', sessionId);
    
    const qrCode = await QRCode.toDataURL(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/session/${sessionId}`);
    
    sessions.set(sessionId, {
      id: sessionId,
      queue: [],
      currentSong: null,
      participants: new Set(),
      qrCode
    });

    console.log('Sessão criada com sucesso:', sessionId);
    console.log('Sessões ativas:', Array.from(sessions.keys()));

    res.json({ 
      sessionId,
      qrCode 
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/video/:videoId', async (req, res) => {
  try {
    const videoInfo = await youtubeService.getVideoInfo(req.params.videoId);
    res.json(videoInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/playlist', async (req, res) => {
  try {
    const { url } = req.query;
    const videos = await youtubeService.getPlaylistVideos(url);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lógica do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('joinSession', ({ sessionId, user }) => {
    console.log(`Tentando entrar na sessão ${sessionId} com usuário:`, user);
    console.log('Sessões disponíveis:', Array.from(sessions.keys()));
    
    const session = sessions.get(sessionId);
    
    if (session) {
      console.log(`Sessão ${sessionId} encontrada`);
      session.participants.add(socket.id);
      socket.join(sessionId);
      
      // Enviar estado atual da sessão
      const sessionState = {
        isHost: user.isHost,
        currentSong: session.currentSong,
        queue: session.queue,
        participants: Array.from(session.participants).length
      };
      
      console.log(`Enviando estado da sessão para ${socket.id}:`, sessionState);
      socket.emit('sessionState', sessionState);
      
      // Notificar outros participantes
      io.to(sessionId).emit('participant-joined', { 
        participantCount: session.participants.size,
        userName: user.name
      });
      
      console.log(`Usuário ${user.name} entrou na sessão ${sessionId} com sucesso`);
    } else {
      console.log(`Sessão ${sessionId} não encontrada`);
      socket.emit('error', { message: 'Session not found' });
    }
  });

  socket.on('addToQueue', ({ sessionId, song }) => {
    console.log(`Adicionando música à fila da sessão ${sessionId}:`, song);
    const session = sessions.get(sessionId);
    if (session) {
      session.queue.push({ ...song, addedBy: socket.id });
      io.to(sessionId).emit('queueUpdate', session.queue);
      
      // Se não houver música tocando, começar a tocar a primeira da fila
      if (!session.currentSong && session.queue.length === 1) {
        session.currentSong = session.queue[0];
        io.to(sessionId).emit('songChange', session.currentSong);
      }
      
      console.log(`Fila atualizada para sessão ${sessionId}:`, session.queue);
    }
  });

  socket.on('removeFromQueue', ({ sessionId, index }) => {
    console.log(`Removendo música do índice ${index} da sessão ${sessionId}`);
    const session = sessions.get(sessionId);
    if (session && session.queue[index]) {
      session.queue.splice(index, 1);
      io.to(sessionId).emit('queueUpdate', session.queue);
      console.log(`Música removida da fila da sessão ${sessionId}`);
    }
  });

  socket.on('playNext', ({ sessionId }) => {
    console.log(`Tocando próxima música da sessão ${sessionId}`);
    const session = sessions.get(sessionId);
    if (session) {
      // Remove a música atual da fila
      if (session.currentSong) {
        session.queue = session.queue.filter(song => song.id !== session.currentSong.id);
      }
      
      // Pega a próxima música da fila
      const nextSong = session.queue[0];
      session.currentSong = nextSong || null;
      
      // Envia as atualizações para todos os clientes
      io.to(sessionId).emit('songChange', session.currentSong);
      io.to(sessionId).emit('queueUpdate', session.queue);
      
      console.log(`Próxima música iniciada na sessão ${sessionId}:`, nextSong);
    }
  });

  socket.on('reorderQueue', ({ sessionId, startIndex, endIndex }) => {
    console.log(`Reordenando fila da sessão ${sessionId}: ${startIndex} -> ${endIndex}`);
    const session = sessions.get(sessionId);
    if (session && session.queue) {
      const [removed] = session.queue.splice(startIndex, 1);
      session.queue.splice(endIndex, 0, removed);
      io.to(sessionId).emit('queueUpdate', session.queue);
      console.log(`Fila reordenada para sessão ${sessionId}:`, session.queue);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    sessions.forEach((session, sessionId) => {
      if (session.participants.has(socket.id)) {
        session.participants.delete(socket.id);
        console.log(`Participante ${socket.id} removido da sessão ${sessionId}`);
        
        if (session.participants.size === 0) {
          sessions.delete(sessionId);
          console.log(`Sessão ${sessionId} removida por falta de participantes`);
        } else {
          io.to(sessionId).emit('participant-left', { 
            participantCount: session.participants.size 
          });
          console.log(`Notificação de saída enviada para sessão ${sessionId}`);
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});