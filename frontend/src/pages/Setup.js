import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ColorAvatar, { colors, getInitials } from '../components/ColorAvatar';
import { config } from '../config';

function Setup() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = localStorage.getItem('isMobile') === 'true';

  useEffect(() => {
    // Verificar se a sessão existe
    const checkSession = async () => {
      if (sessionId) {
        setIsLoading(true);
        try {
          console.log('Verificando sessão no Setup:', sessionId);
          const response = await fetch(`${config.backendUrl}/api/sessions/${sessionId}`);
          if (!response.ok) {
            console.error('Sessão não encontrada no Setup');
            setError('Sessão não encontrada');
            navigate('/');
          } else {
            console.log('Sessão encontrada no Setup');
          }
        } catch (err) {
          console.error('Erro ao verificar sessão no Setup:', err);
          setError('Erro ao verificar sessão');
          navigate('/');
        }
        setIsLoading(false);
      }
    };

    checkSession();
  }, [sessionId, navigate]);

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Por favor, insira seu nome');
      return;
    }

    if (!sessionId) {
      setError('ID da sessão inválido');
      return;
    }

    try {
      console.log('Iniciando entrada na sessão:', {
        sessionId,
        name: name.trim(),
        isMobile,
        isHost: localStorage.getItem('isHost') === 'true'
      });

      // Gerar ID único para o usuário se não existir
      const userId = localStorage.getItem('userId') || Math.random().toString(36).substr(2, 9);
      const isHost = localStorage.getItem('isHost') === 'true';
      
      // Salvar dados do usuário
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name.trim());
      
      // Salvar a cor no formato correto (ex: "red-500" em vez de "bg-red-500")
      const colorValue = selectedColor.bg.replace('bg-', '');
      localStorage.setItem('userColor', colorValue);

      console.log('Dados do usuário salvos:', {
        userId,
        userName: name.trim(),
        userColor: colorValue,
        isHost,
        isMobile
      });

      // Navegar para a sessão
      console.log('Navegando para a sessão');
      navigate(`/session/${sessionId}`);
    } catch (err) {
      console.error('Erro ao entrar na sessão:', err);
      setError('Erro ao entrar na sessão');
    }
  };

  // Gerar iniciais quando o nome mudar
  const initials = name ? getInitials(name) : '?';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-white">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <div className="text-xl">Verificando sessão...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-2">
            Configurar Perfil
          </h1>
          <p className="text-purple-200">
            {isMobile 
              ? 'Configure seu perfil para escolher músicas'
              : 'Personalize seu perfil para a sessão de karaokê'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-100 p-4 rounded-lg backdrop-blur-lg">
            {error}
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Seu nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-purple-200 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Escolha sua cor
            </label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <div
                  key={color.bg}
                  onClick={() => setSelectedColor(color)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-110
                    ${selectedColor.bg === color.bg ? 'ring-2 ring-white ring-offset-2 ring-offset-purple-600 scale-110' : ''}`}
                >
                  <ColorAvatar color={color} initials={initials} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleJoin}
            className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-400 
              rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
              text-white flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Confirmar e Entrar</span>
          </button>
        </div>

        <div className="text-center">
          <div className="text-sm text-purple-200">
            Sessão #{sessionId}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setup;
