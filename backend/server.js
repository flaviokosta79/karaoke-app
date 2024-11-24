const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const youtubeService = require('./services/youtubeService');

const app = express();
const server = http.createServer(app);

// Configuração do CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

// Configuração do Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

// Armazenamento em memória das sessões
const sessions = new Map();

// Rota de teste para verificar se o servidor está rodando
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Função para gerar ID numérico de 4 dígitos
function generateSessionId() {
  let sessionId;
  do {
    sessionId = Math.floor(1000 + Math.random() * 9000).toString();
  } while (sessions.has(sessionId));
  return sessionId;
}

// Rotas da API
app.post('/api/sessions', async (req, res) => {
  try {
    console.log('Criando nova sessão...');
    const sessionId = generateSessionId();
    console.log('ID da sessão gerado:', sessionId);
    
    // Criar nova sessão
    const session = {
      id: sessionId,
      queue: [],
      users: new Map(),
      participants: [],
      currentSong: null,
      isPlaying: false
    };
    
    sessions.set(sessionId, session);
    console.log('Sessão criada na memória');

    // Gerar QR Code
    const sessionUrl = `http://localhost:3000/session/${sessionId}`;
    console.log('URL da sessão:', sessionUrl);
    
    const qrCode = await QRCode.toDataURL(sessionUrl);
    console.log('QR Code gerado');

    const response = {
      sessionId,
      qrCode,
      url: sessionUrl
    };
    
    console.log('Enviando resposta:', response);
    res.json(response);
    
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    res.status(500).json({ 
      error: 'Erro ao criar sessão',
      details: error.message 
    });
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
  console.log('Novo cliente conectado');
  let userSession = null;
  let userData = null;

  socket.on('joinSession', ({ sessionId, userId, userName, isHost, userColor }) => {
    console.log(`Usuário ${userName} tentando entrar na sessão ${sessionId}`);
    
    const session = sessions.get(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Sessão não encontrada' });
      return;
    }

    // Salvar dados do usuário
    userData = { userId, userName, isHost, userColor };
    userSession = session;
    
    // Adicionar usuário à lista de participantes da sessão
    if (!session.participants.find(p => p.userId === userId)) {
      session.participants.push(userData);
    }

    // Entrar na sala Socket.IO da sessão
    socket.join(sessionId);
    
    // Enviar lista atualizada de participantes para todos na sessão
    io.to(sessionId).emit('participantsUpdate', session.participants);

    // Se houver uma música tocando, enviar para o novo participante
    if (session.currentSong) {
      socket.emit('songUpdate', session.currentSong);
    }
    
    console.log(`Usuário ${userName} entrou na sessão ${sessionId}`);
    console.log('Participantes atuais:', session.participants);
  });

  socket.on('disconnect', () => {
    if (userSession && userData) {
      // Remover usuário da lista de participantes
      userSession.participants = userSession.participants.filter(
        p => p.userId !== userData.userId
      );
      
      // Enviar lista atualizada de participantes
      io.to(userSession.id).emit('participantsUpdate', userSession.participants);
      
      console.log(`Usuário ${userData.userName} saiu da sessão ${userSession.id}`);
      console.log('Participantes atuais:', userSession.participants);
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
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Configurações CORS:', {
    origins: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"]
  });
});