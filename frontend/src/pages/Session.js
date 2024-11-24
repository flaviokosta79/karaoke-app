import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import KaraokePlayer from '../components/session/KaraokePlayer';
import { config } from '../config';
import { toast } from 'react-toastify';

function Session() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isHost, setIsHost] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [participants, setParticipants] = useState([]);

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
        setIsHost(isHost);
        
        // Configurar handlers de eventos
        newSocket.on('connect', () => {
          console.log('Socket connected successfully');
          if (!mounted) return;
          setConnected(true);
          setConnecting(false);

          // Enviar dados do usuário ao conectar
          newSocket.emit('joinSession', {
            sessionId,
            userId,
            userName,
            isHost,
            userColor: `bg-${userColor}`
          });
        });

        // Novo evento para atualização de participantes
        newSocket.on('participantsUpdate', (updatedParticipants) => {
          if (!mounted) return;
          console.log('Participants update:', updatedParticipants);
          setParticipants(updatedParticipants);
          
          // Encontrar o último participante que entrou
          const lastParticipant = updatedParticipants[updatedParticipants.length - 1];
          if (lastParticipant && lastParticipant.userId !== userId) {
            toast.info(`${lastParticipant.userName} entrou na sessão!`);
          }
        });

        newSocket.on('songUpdate', (song) => {
          if (!mounted) return;
          console.log('Song update:', song);
          setCurrentSong(song);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          if (!mounted) return;
          setConnected(false);
          setConnecting(true);
        });

        newSocket.on('error', (error) => {
          console.error('Socket error:', error);
          if (!mounted) return;
          setError('Erro de conexão');
          setConnecting(false);
        });

      } catch (err) {
        console.error('Error connecting to session:', err);
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
        socket.disconnect();
      }
    };
  }, [sessionId, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">Conectando à sessão...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isHost ? (
        <KaraokePlayer
          socket={socket}
          sessionId={sessionId}
          isHost={isHost}
          currentSong={currentSong}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Sessão de Karaokê</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Participantes Online:</h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div 
                    key={participant.userId}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                  >
                    <span 
                      className={`w-3 h-3 rounded-full ${participant.userColor}`}
                    />
                    <span>{participant.userName}</span>
                    {participant.isHost && (
                      <span className="text-sm text-gray-500">(Host)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {currentSong && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Música Atual:</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-medium">{currentSong.title}</p>
                  <p className="text-sm text-gray-600">{currentSong.artist}</p>
                </div>
              </div>
            )}
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-blue-700">
                Aguarde o host iniciar as músicas. Você pode ver a lista de participantes
                e acompanhar a sessão em tempo real.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Session;
