import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';
import { Loader2 } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear any existing user data when landing on home page
  localStorage.removeItem('userData');

  const createSession = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Creating session with backend URL:', config.backendUrl);
      const response = await fetch(`${config.backendUrl}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      console.log('Session created:', data);

      // Gerar ID único para o usuário host
      const userId = Math.random().toString(36).substr(2, 9);
      
      // Store user data
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', 'Host');
      localStorage.setItem('isHost', 'true');

      // Navigate to setup page with the new session ID
      navigate(`/setup/${data.sessionId}`);
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = () => {
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Karaoke Social
          </h1>
          <p className="text-gray-600">
            Crie uma nova sessão ou junte-se a uma existente
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
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

          <button
            onClick={joinSession}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Entrar em uma Sessão
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
