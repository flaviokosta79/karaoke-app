import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import KaraokePlayer from '../components/session/KaraokePlayer';
import { config } from '../config';

function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isHost, setIsHost] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const connectToSession = async () => {
      try {
        // Verificar se temos os dados do usuário
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        const isHost = localStorage.getItem('isHost') === 'true';
        const userColor = localStorage.getItem('userColor');

        if (!userId || !userName) {
          console.error('Missing user data');
          if (mounted) {
            setError('Dados do usuário não encontrados');
            setTimeout(() => navigate('/'), 2000);
          }
          return;
        }

        console.log('Connecting to server at:', config.backendUrl);
        const newSocket = io(config.backendUrl, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });

        if (!mounted) return;
        setSocket(newSocket);
        
        // Configurar handlers de eventos
        newSocket.on('connect', () => {
          console.log('Socket connected successfully');
          if (!mounted) return;
          
          const userData = {
            id: userId,
            name: userName,
            isHost: isHost,
            color: userColor ? JSON.parse(userColor) : null
          };

          console.log('Joining session with user data:', userData);
          newSocket.emit('joinSession', {
            sessionId,
            user: userData
          });
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          if (!mounted) return;
          setError('Erro ao conectar ao servidor. Por favor, tente novamente.');
          setConnecting(false);
        });

        newSocket.on('sessionState', (state) => {
          console.log('Received session state:', state);
          if (!mounted) return;
          setIsHost(state.isHost);
          setCurrentSong(state.currentSong);
          setConnected(true);
          setConnecting(false);
        });

        newSocket.on('error', (err) => {
          console.error('Socket error:', err);
          if (!mounted) return;
          setError(err.message);
          setConnecting(false);
          if (err.message === 'Session not found') {
            setTimeout(() => navigate('/'), 2000);
          }
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          if (!mounted) return;
          setConnected(false);
          setConnecting(true);
        });

      } catch (error) {
        console.error('Error in connectToSession:', error);
        if (mounted) {
          setError('Erro ao conectar à sessão');
          setConnecting(false);
        }
      }
    };

    connectToSession();

    return () => {
      mounted = false;
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, [sessionId, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-red-600 mb-4">Erro: {error}</div>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            Voltar para o Início
          </a>
        </div>
      </div>
    );
  }

  if (connecting || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">
            {connecting ? 'Conectando à sessão...' : 'Reconectando...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <KaraokePlayer
        sessionId={sessionId}
        isHost={isHost}
        song={currentSong}
        socket={socket}
      />
    </div>
  );
}

export default Session;
