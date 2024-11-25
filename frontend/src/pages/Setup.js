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
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-xl text-gray-600">Verificando sessão...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configurar Perfil
          </h1>
          <p className="text-gray-600">
            {isMobile 
              ? 'Configure seu perfil para escolher músicas'
              : 'Personalize seu perfil para a sessão de karaokê'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Seu nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha sua cor
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <div
                  key={color.bg}
                  onClick={() => setSelectedColor(color)}
                  className={`p-1 rounded-lg cursor-pointer ${
                    selectedColor.bg === color.bg ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                >
                  <ColorAvatar color={color} initials={initials} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleJoin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Entrar na Sessão
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setup;
