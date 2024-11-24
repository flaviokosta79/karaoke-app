import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ColorAvatar, { colors, getInitials } from '../components/ColorAvatar';

function Setup() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [joinSessionId, setJoinSessionId] = useState(sessionId || '');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Por favor, insira seu nome');
      return;
    }

    if (!joinSessionId.trim()) {
      setError('Por favor, insira o ID da sessão');
      return;
    }

    // Gerar ID único para o usuário
    const userId = Math.random().toString(36).substr(2, 9);
    
    // Salvar dados do usuário
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', name.trim());
    localStorage.setItem('isHost', sessionId ? 'true' : 'false');
    
    // Salvar a cor no formato correto (ex: "red-500" em vez de "bg-red-500")
    const colorValue = selectedColor.bg.replace('bg-', '');
    localStorage.setItem('userColor', colorValue);

    // Navegar para a sessão
    navigate(`/session/${joinSessionId}`);
  };

  // Gerar iniciais quando o nome mudar
  const initials = name ? getInitials(name) : '?';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {sessionId ? 'Configurar Sessão' : 'Entrar em uma Sessão'}
          </h1>
          <p className="text-gray-600">
            {sessionId 
              ? 'Configure sua nova sessão de karaokê'
              : 'Entre em uma sessão existente'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Seu Nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Digite seu nome"
            />
          </div>

          {!sessionId && (
            <div>
              <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700">
                ID da Sessão
              </label>
              <input
                type="text"
                id="sessionId"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Digite o ID da sessão"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escolha sua Cor
            </label>
            <div className="grid grid-cols-4 gap-4">
              {colors.map((color) => (
                <ColorAvatar
                  key={color.bg}
                  color={color}
                  selected={selectedColor}
                  onClick={() => setSelectedColor(color)}
                  initials={initials}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleJoin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {sessionId ? 'Iniciar Sessão' : 'Entrar na Sessão'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setup;
