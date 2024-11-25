const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const youtubeService = require('./services/youtubeService');

const app = express();
const server = http.createServer(app);

// Lista de origens permitidas
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.101.5:3000"  // Seu IP local
];

// Configuração do CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

// Configuração do Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

// Armazenamento em memória das sessões
const sessions = new Map();

// Constantes para timeout
const SESSION_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas em milissegundos
const CLEANUP_INTERVAL = 30 * 60 * 1000;    // Verifica sessões a cada 30 minutos

// Função para limpar sessões antigas
function cleanupSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT && session.participants.length === 0) {
      console.log(`Removendo sessão inativa ${sessionId}`);
      sessions.delete(sessionId);
    }
  }
}

// Agenda a limpeza periódica de sessões
setInterval(cleanupSessions, CLEANUP_INTERVAL);

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
      isPlaying: false,
      lastActivity: Date.now() // Adiciona timestamp de criação
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

// Rota para verificar se uma sessão existe
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Sessão não encontrada' });
  }
  
  res.json({ 
    sessionId: session.id,
    participantsCount: session.participants.length
  });
});

// Rota para listar todas as sessões ativas
app.get('/api/sessions', (req, res) => {
  try {
    const activeSessions = [];
    const now = Date.now();

    for (const [sessionId, session] of sessions.entries()) {
      // Só retorna sessões que foram ativas nos últimos 30 minutos
      if (now - session.lastActivity < 30 * 60 * 1000) {
        activeSessions.push({
          sessionId,
          participants: session.participants.length,
          currentSong: session.currentSong,
          queueSize: session.queue.length,
          lastActivity: session.lastActivity
        });
      }
    }

    console.log('Sessões ativas encontradas:', activeSessions.length);
    res.json(activeSessions);
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
    res.status(500).json({ error: 'Erro ao listar sessões' });
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

    // Verificar se já existe um host na sessão
    const existingHost = session.participants.find(p => p.isHost);
    if (isHost && existingHost) {
      socket.emit('error', { message: 'Já existe um host nesta sessão' });
      return;
    }

    // Se não houver host e houver outros participantes, não permite entrar como host
    if (isHost && session.participants.length > 0) {
      socket.emit('error', { message: 'Não é possível entrar como host em uma sessão com participantes' });
      return;
    }

    // Salvar dados do usuário
    userData = { userId, userName, isHost, userColor };
    userSession = session;
    
    // Adicionar à sessão
    socket.join(sessionId);
    session.participants.push(userData);
    
    // Notificar todos os participantes
    io.to(sessionId).emit('participantJoined', userData);
    io.to(sessionId).emit('participantList', session.participants);
    
    // Enviar estado atual para o novo participante
    socket.emit('queueUpdate', session.queue);
    
    // Se houver uma música tocando, enviar para o novo participante
    if (session.currentSong) {
      socket.emit('songUpdate', session.currentSong);
    }
    
    session.lastActivity = Date.now();
    
    console.log(`Usuário ${userName} entrou na sessão ${sessionId}`);
    console.log('Participantes atuais:', session.participants);
  });

  socket.on('disconnect', () => {
    if (userSession && userData) {
      const sessionId = userSession.id;
      
      // Remover participante da sessão
      const participantIndex = userSession.participants.findIndex(p => p.userId === userData.userId);
      if (participantIndex !== -1) {
        userSession.participants.splice(participantIndex, 1);
        
        // Se o host saiu e ainda há participantes, passar o controle para o primeiro participante
        if (userData.isHost && userSession.participants.length > 0) {
          const newHost = userSession.participants[0];
          newHost.isHost = true;
          io.to(sessionId).emit('participantList', userSession.participants);
          io.to(sessionId).emit('hostChanged', newHost);
        }
        
        // Se não há mais participantes, limpar a sessão após o timeout
        if (userSession.participants.length === 0) {
          setTimeout(() => {
            const session = sessions.get(sessionId);
            if (session && session.participants.length === 0) {
              console.log(`Removendo sessão vazia ${sessionId}`);
              sessions.delete(sessionId);
            }
          }, SESSION_TIMEOUT);
        }
        
        io.to(sessionId).emit('participantLeft', userData);
        io.to(sessionId).emit('participantList', userSession.participants);
      }
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
      
      session.lastActivity = Date.now(); // Atualiza timestamp
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
      console.log('Estado da fila antes da reordenação:', session.queue.map(song => song.title));

      // Não permite mover músicas para a posição 0 (música tocando)
      if (newIndex === 0) {
        console.log('Tentativa de mover música para posição 0 bloqueada');
        return;
      }

      // Encontra o índice atual da música que está sendo movida
      const currentIndex = session.queue.findIndex(song => song.queueId === queueId);
      
      // Não permite mover a música que está tocando
      if (currentIndex === 0) {
        console.log('Tentativa de mover música atual bloqueada');
        return;
      }

      if (currentIndex !== -1) {
        // Remove a música da posição atual
        const [song] = session.queue.splice(currentIndex, 1);
        // Insere na nova posição
        session.queue.splice(newIndex, 0, song);
        
        console.log('Estado da fila após reordenação:', session.queue.map(song => song.title));
        
        io.to(sessionId).emit('queueUpdate', session.queue);
        
        session.lastActivity = Date.now(); // Atualiza timestamp
      }
    }
  });

  socket.on('playNext', ({ sessionId, index }) => {
    const session = sessions.get(sessionId);
    if (session && session.queue.length > 0) {
      // Desativa a música que estava tocando anteriormente
      const currentPlayingIndex = session.queue.findIndex(song => song.playing);
      if (currentPlayingIndex !== -1) {
        session.queue[currentPlayingIndex].playing = false;
      }

      let nextSongIndex;
      if (index !== undefined) {
        nextSongIndex = index;
      } else {
        // Se não houver índice específico, pega a próxima música após a atual
        nextSongIndex = currentPlayingIndex !== -1 ? currentPlayingIndex + 1 : 0;
        // Se chegou ao fim da fila, volta para o início
        if (nextSongIndex >= session.queue.length) {
          nextSongIndex = 0;
        }
      }

      if (nextSongIndex >= 0 && nextSongIndex < session.queue.length) {
        // Remove a música da sua posição atual e a marca como tocando
        const nextSong = session.queue.splice(nextSongIndex, 1)[0];
        nextSong.playing = true;
        
        // Insere a música no início da fila
        session.queue.unshift(nextSong);
        
        io.to(sessionId).emit('songChange', nextSong);
        io.to(sessionId).emit('queueUpdate', session.queue);
        
        session.lastActivity = Date.now(); // Atualiza timestamp
      } else {
        // Se não houver mais músicas, para a reprodução
        io.to(sessionId).emit('playingStateUpdate', false);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Origens permitidas:', allowedOrigins);
});