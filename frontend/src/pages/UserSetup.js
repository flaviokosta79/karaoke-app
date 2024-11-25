import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { config } from '../config';

const avatarColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function UserSetup() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have a valid session ID
    if (!urlSessionId) {
      navigate('/');
      return;
    }

    const verifySession = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${config.backendUrl}/api/sessions/${urlSessionId}`);
        if (!response.ok) {
          throw new Error('Session not found');
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        setError('Invalid session. Please try again.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [urlSessionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store user data
      const userData = {
        name: name.trim(),
        color: selectedColor,
        isHost: false,
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Navigate to session
      navigate(`/session/${urlSessionId}`);
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to join session. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <CircularProgress className="animate-spin h-5 w-5" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Join Session
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your name and choose an avatar color
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Your Color
            </label>
            <div className="grid grid-cols-4 gap-4">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-12 h-12 rounded-full ${color} ${
                    selectedColor === color
                      ? 'ring-4 ring-blue-500 ring-offset-2'
                      : ''
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <CircularProgress className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Joining...
              </>
            ) : (
              'Join Session'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserSetup;
