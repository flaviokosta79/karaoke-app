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

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Rota de teste para verificar se o servidor está rodando
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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
    
    // Criar nova sessão
    sessions.set(sessionId, {
      id: sessionId,
      queue: [],
      users: new Map(),
      currentSong: null,
      isPlaying: false
    });

    // Gerar QR Code
    const sessionUrl = `${req.protocol}://${req.get('host')}/session/${sessionId}`;
    const qrCode = await QRCode.toDataURL(sessionUrl);

    res.json({
      sessionId,
      qrCode,
      url: sessionUrl
    });
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ error: 'Erro ao criar sessão' });
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
let queueIdCounter = 0;

io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);

  socket.on('joinSession', ({ sessionId, user }) => {
    console.log(`Tentando entrar na sessão ${sessionId} com usuário:`, user);
    console.log('Sessões disponíveis:', Array.from(sessions.keys()));
    
    const session = sessions.get(sessionId);
    
    if (session) {
      console.log(`Sessão ${sessionId} encontrada`);
      session.users.set(socket.id, user);
      socket.join(sessionId);
      
      // Enviar estado atual da sessão
      const sessionState = {
        isHost: user.isHost,
        currentSong: session.currentSong,
        queue: session.queue,
        participants: Array.from(session.users.values()).length
      };
      
      console.log(`Enviando estado da sessão para ${socket.id}:`, sessionState);
      socket.emit('sessionState', sessionState);
      
      // Notificar outros participantes
      io.to(sessionId).emit('participant-joined', { 
        participantCount: session.users.size,
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
      // Adiciona um ID único para a instância da música na fila
      const queueId = `queue-${queueIdCounter++}`;
      console.log('Gerando queueId:', queueId);
      
      const newSong = { 
        ...song, 
        playing: false,
        queueId // ID único para cada música na fila
      };
      session.queue.push(newSong);
      console.log('Música adicionada com queueId:', newSong);
      
      // Se não houver música tocando e esta é a primeira música, começar a tocar
      if (!session.currentSong && session.queue.length === 1) {
        session.currentSong = { ...newSong };
        session.queue[0].playing = true;
        session.isPlaying = true;
        io.to(sessionId).emit('songChange', session.currentSong);
        io.to(sessionId).emit('playingStateUpdate', session.isPlaying);
      }
      
      io.to(sessionId).emit('queueUpdate', session.queue);
      console.log('Estado atual da fila:', session.queue.map(s => ({ title: s.title, queueId: s.queueId })));
    }
  });

  socket.on('removeFromQueue', ({ sessionId, index }) => {
    console.log(`Removendo música do índice ${index} da sessão ${sessionId}`);
    const session = sessions.get(sessionId);
    if (session && session.queue[index]) {
      const removedSong = session.queue[index];
      const wasPlaying = removedSong.playing;
      
      // Remove a música da fila
      session.queue.splice(index, 1);

      // Se a música removida estava tocando
      if (wasPlaying) {
        // Se ainda houver músicas na fila, toca a próxima
        if (session.queue.length > 0) {
          session.queue[0].playing = true;
          io.to(sessionId).emit('songChange', session.queue[0]);
        } else {
          // Se não houver mais músicas, para a reprodução
          io.to(sessionId).emit('playingStateUpdate', false);
        }
      }

      io.to(sessionId).emit('queueUpdate', session.queue);
      console.log(`Música removida da fila da sessão ${sessionId}`);
    }
  });

  socket.on('songEnded', ({ sessionId }) => {
    const session = sessions.get(sessionId);
    if (session) {
      // Remove a primeira música da fila (que acabou)
      session.queue.shift();

      // Se ainda houver músicas na fila, toca a próxima
      if (session.queue.length > 0) {
        session.queue[0].playing = true;
        io.to(sessionId).emit('songChange', session.queue[0]);
      } else {
        // Se não houver mais músicas, para a reprodução
        io.to(sessionId).emit('playingStateUpdate', false);
      }

      io.to(sessionId).emit('queueUpdate', session.queue);
    }
  });

  socket.on('reorderQueue', ({ sessionId, queueId, newIndex }) => {
    console.log(`Reordenando fila da sessão ${sessionId}: ${queueId} -> ${newIndex}`);
    const session = sessions.get(sessionId);
    if (session) {
      console.log('Estado da fila antes da reordenação:', 
        session.queue.map(s => ({ title: s.title, queueId: s.queueId }))
      );

      // Encontra o item a ser movido
      const songToMoveIndex = session.queue.findIndex(song => song.queueId === queueId);
      if (songToMoveIndex !== -1) {
        const songToMove = session.queue[songToMoveIndex];
        console.log('Música a ser movida:', songToMove);

        // Remove o item da posição original
        session.queue.splice(songToMoveIndex, 1);

        // Insere o item na nova posição
        session.queue.splice(newIndex, 0, songToMove);
        
        // Atualiza o estado playing baseado no índice
        session.queue.forEach((song, index) => {
          song.playing = index === 0;
        });
        
        console.log('Estado da fila após reordenação:', 
          session.queue.map(s => ({ title: s.title, queueId: s.queueId }))
        );
        
        io.to(sessionId).emit('queueUpdate', session.queue);
      }
    }
  });

  socket.on('playNext', ({ sessionId, index }) => {
    const session = sessions.get(sessionId);
    if (session && session.queue.length > 0) {
      // Encontra e remove a música que está tocando atualmente
      const currentPlayingIndex = session.queue.findIndex(song => song.playing);
      if (currentPlayingIndex !== -1) {
        session.queue.splice(currentPlayingIndex, 1);
      }

      // Se um índice específico foi fornecido, toca essa música
      if (index !== undefined) {
        session.queue[index].playing = true;
        io.to(sessionId).emit('songChange', session.queue[index]);
      } else if (session.queue.length > 0) {
        // Se não houver índice específico, toca a primeira música da fila
        session.queue[0].playing = true;
        io.to(sessionId).emit('songChange', session.queue[0]);
      } else {
        // Se não houver mais músicas, para a reprodução
        io.to(sessionId).emit('playingStateUpdate', false);
      }

      io.to(sessionId).emit('queueUpdate', session.queue);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    sessions.forEach((session, sessionId) => {
      if (session.users.has(socket.id)) {
        session.users.delete(socket.id);
        console.log(`Participante ${socket.id} removido da sessão ${sessionId}`);
        
        if (session.users.size === 0) {
          sessions.delete(sessionId);
          console.log(`Sessão ${sessionId} removida por falta de participantes`);
        } else {
          io.to(sessionId).emit('participant-left', { 
            participantCount: session.users.size 
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