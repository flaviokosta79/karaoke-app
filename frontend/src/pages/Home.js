import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { Loader2 } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [autoSearchEnabled] = useState(true); // Sempre ativo, sem opção de mudar
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      console.log('Verificação mobile:', { largura: window.innerWidth, isMobile: mobile });
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Limpa o localStorage ao carregar a página
    localStorage.removeItem('userData');
    console.log('LocalStorage limpo');

    // Inicia a busca automática de sessões
    if (autoSearchEnabled) {
      fetchActiveSessions();
      const interval = setInterval(fetchActiveSessions, 5000); // Atualiza a cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [autoSearchEnabled]);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/api/sessions`);
      if (!response.ok) throw new Error('Erro ao buscar sessões');
      const sessions = await response.json();
      setActiveSessions(sessions);
      console.log('Sessões encontradas:', sessions);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
    }
  };

  const createSession = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Criando sessão com URL:', config.backendUrl);
      const response = await fetch(`${config.backendUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao criar sessão');
      }

      const data = await response.json();
      console.log('Sessão criada:', data);

      const userId = Math.random().toString(36).substr(2, 9);
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', 'Host');
      localStorage.setItem('isHost', 'true');
      localStorage.setItem('isMobile', 'false');

      console.log('Dados salvos no localStorage:', {
        userId,
        userName: 'Host',
        isHost: true,
        isMobile: false
      });

      navigate(`/setup/${data.sessionId}`);
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
      setError(err.message || 'Falha ao criar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (fromSessionCard = false, cardSessionId = null) => {
    // Se vier do card, usa o ID do card diretamente
    const idToUse = fromSessionCard ? cardSessionId : sessionId;

    if (!idToUse) {
      setError('Por favor, digite o ID da sessão');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Verificando sessão:', idToUse);
      const response = await fetch(`${config.backendUrl}/api/sessions/${idToUse}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Sessão não encontrada');
      }

      const userId = Math.random().toString(36).substr(2, 9);
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('isHost', 'false');
      localStorage.setItem('isMobile', isMobile.toString());

      console.log('Dados salvos no localStorage:', {
        userId,
        isHost: false,
        isMobile,
        sessionId: idToUse
      });

      console.log('Navegando para setup da sessão:', idToUse);
      navigate(`/setup/${idToUse}`);
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setError('Erro ao verificar sessão. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleJoinForm = () => {
    console.log('Abrindo formulário de entrada');
    setShowJoinForm(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Karaoke App</h1>
          <p className="text-purple-200">Conecte-se e cante com amigos</p>
        </div>
      
        {isMobile ? (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Sessões Disponíveis</h2>
                <div className="text-sm text-purple-200">
                  Atualizando automaticamente...
                </div>
              </div>
              
              {activeSessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {activeSessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-200 border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium">Sessão #{session.sessionId}</div>
                          <div className="text-sm text-purple-200">
                            {session.participants} participante{session.participants !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right text-sm text-purple-200">
                          <div>{session.queueSize} música{session.queueSize !== 1 ? 's' : ''} na fila</div>
                          {session.currentSong && (
                            <div className="mt-1 text-green-300">
                              ♪ {session.currentSong.title}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinSession(true, session.sessionId)}
                        disabled={isLoading}
                        className="mt-4 w-full py-2 px-4 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-400 
                          rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                          flex items-center justify-center space-x-2"
                      >
                        {isLoading && session.sessionId === sessionId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Entrando...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span>Entrar na Sessão</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-purple-200">
                  <div className="text-4xl mb-2">🎤</div>
                  <p>Nenhuma sessão ativa no momento</p>
                  <p className="text-sm mt-1">Crie uma nova sessão ou aguarde alguém criar</p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Entrar com ID da Sessão</h3>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Digite o ID da sessão"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-200 text-white"
                />
                <button
                  onClick={() => handleJoinSession(false)}
                  disabled={isLoading || !sessionId}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 
                    ${isLoading || !sessionId 
                      ? 'bg-purple-400 cursor-not-allowed' 
                      : 'bg-purple-500 hover:bg-purple-400 active:transform active:scale-[0.98]'}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    'Entrar na Sessão'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Karaoke Social
              </h1>
              {isMobile ? (
                <p className="text-gray-600">
                  Entre em uma sessão para escolher músicas
                </p>
              ) : (
                <p className="text-gray-600">
                  Crie uma nova sessão ou junte-se a uma existente
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!isMobile && (
                <button
                  onClick={createSession}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Criando sessão...
                    </>
                  ) : (
                    'Criar Nova Sessão'
                  )}
                </button>
              )}

              {isMobile && (
                <div>
                  <h2>Entrar em uma Sessão</h2>
                  <div className="session-list">
                    <h3>Sessões Ativas</h3>
                    {activeSessions.length > 0 ? (
                      <div className="sessions-grid">
                        {activeSessions.map((session) => (
                          <div
                            key={session.sessionId}
                            className="session-card"
                            onClick={() => {
                              setSessionId(session.sessionId);
                              handleJoinSession(true);
                            }}
                          >
                            <div className="session-info">
                              <div>ID: {session.sessionId}</div>
                              <div>Participantes: {session.participants}</div>
                              <div>Músicas na fila: {session.queueSize}</div>
                              {session.currentSong && (
                                <div>Tocando: {session.currentSong.title}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>Nenhuma sessão ativa encontrada</p>
                    )}
                  </div>

                  <div className="manual-join">
                    <h3>Ou digite o ID da sessão:</h3>
                    <input
                      type="text"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      placeholder="ID da Sessão"
                    />
                    <button onClick={() => handleJoinSession(false)} disabled={isLoading}>
                      {isLoading ? 'Entrando...' : 'Entrar na Sessão'}
                    </button>
                  </div>
                </div>
              )}

              {!isMobile && (
                <div>
                  {showJoinForm ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        placeholder="Digite o ID da sessão"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleJoinSession(false)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                            Entrando na sessão...
                          </>
                        ) : (
                          'Entrar na Sessão'
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={toggleJoinForm}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Entrar em uma Sessão
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
