import io from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Configuração do Socket.IO
export const socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
});

// Função para criar uma nova sessão
export const createSession = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao criar sessão');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        throw error;
    }
};

// Função para buscar músicas do YouTube
export const searchYouTube = async (query) => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/youtube/search?q=${encodeURIComponent(query)}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar músicas');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        throw error;
    }
};
