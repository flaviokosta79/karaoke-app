import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Play, SkipForward, Search, Star, Smartphone, Settings, X, GripVertical, Pause, Volume2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { config } from '../../config';
import io from 'socket.io-client';
import YouTubePlayer from './YouTubePlayer';

function SortableItem({ song, index, isHost, playNext, removeFromQueue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: '256px',
    flexShrink: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-lg shadow-sm ${
        isDragging ? 'shadow-lg ring-2 ring-pink-500 z-50' : ''
      }`}
    >
      <div className="flex items-center">
        {isHost && (
          <div
            {...attributes}
            {...listeners}
            className="mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{song.title}</div>
          <div className="text-sm text-gray-600 truncate">{song.artist}</div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {isHost && (
            <button
              onClick={() => playNext()}
              className="text-gray-400 hover:text-pink-600"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => removeFromQueue(index)}
            className="text-gray-400 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KaraokePlayer({ song: currentSong, isHost, sessionId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [songQueue, setSongQueue] = useState([]);
  const [songs, setSongs] = useState([
    { id: 1, title: 'Numb', artist: 'Linkin Park', cover: 'https://via.placeholder.com/48', videoId: 'yUVapAM_BQI' },
    { id: 2, title: 'Creep', artist: 'Radiohead', cover: 'https://via.placeholder.com/48', videoId: 'vZ1q0iwM9XQ' },
    { id: 3, title: 'A Whole New World', artist: 'Aladdin', cover: 'https://via.placeholder.com/48', videoId: 'MklqiL3WN5U' },
    { id: 4, title: 'A Thousand Years', artist: 'Christina Perri', cover: 'https://via.placeholder.com/48', videoId: '2YI9i9ftkyw' },
    { id: 5, title: 'Here Without You', artist: '3 Doors Down', cover: 'https://via.placeholder.com/48', videoId: 'tMtn3QF537A' },
    { id: 6, title: 'Help Me Make It Through the Night', artist: 'Sammi Smith', cover: 'https://via.placeholder.com/48', videoId: 'JoiyE7p1tpE' },
    { id: 7, title: 'Green Green Grass of Home', artist: 'Tom Jones', cover: 'https://via.placeholder.com/48', videoId: 'f9B7Xkp3qdo' },
    { id: 8, title: 'Girl on Fire', artist: 'Alicia Keys', cover: 'https://via.placeholder.com/48', videoId: 'EYXZJEMc4bc' },
    { id: 9, title: "Don't Cry", artist: "Guns N' Roses", cover: 'https://via.placeholder.com/48', videoId: 'bUs3eMD-USk' },
    { id: 10, title: 'Do You Want to Build a Snowman', artist: 'Frozen', cover: 'https://via.placeholder.com/48', videoId: 'un3-E5uy2MI' }
  ]);

  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    console.log('Initializing socket connection...');
    console.log('Backend URL:', config.backendUrl);
    console.log('Session ID:', sessionId);
    
    // Recuperar dados do usuário
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const isHost = localStorage.getItem('isHost') === 'true';
    const userColor = localStorage.getItem('userColor');

    if (!userId || !userName) {
      console.error('Missing user data');
      return;
    }

    // Criar conexão do socket
    socketRef.current = io(config.backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully');
      
      // Enviar dados do usuário ao entrar na sessão
      const userData = {
        id: userId,
        name: userName,
        isHost: isHost,
        color: userColor ? JSON.parse(userColor) : null
      };

      console.log('Joining session with data:', {
        sessionId,
        user: userData
      });

      socketRef.current.emit('joinSession', {
        sessionId,
        user: userData
      });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Ouvir atualizações da fila
    socketRef.current.on('queueUpdate', (updatedQueue) => {
      console.log('Queue updated:', updatedQueue);
      setSongQueue(updatedQueue);
    });

    // Ouvir mudanças de música
    socketRef.current.on('songChange', (song) => {
      console.log('Song changed:', song);
      if (song) {
        setCurrentVideoId(song.videoId);
      }
    });

    // Ouvir estado da sessão
    socketRef.current.on('sessionState', (state) => {
      console.log('Received session state:', state);
      if (state.currentSong) {
        setCurrentVideoId(state.currentSong.videoId);
      }
      if (state.queue) {
        setSongQueue(state.queue);
      }
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [sessionId]);

  const addToQueue = (song) => {
    console.log('Adding song to queue:', song);
    console.log('Session ID:', sessionId);
    console.log('Socket connected:', socketRef.current?.connected);
    
    if (!socketRef.current?.connected) {
      console.error('Socket not connected');
      return;
    }

    const songData = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      videoId: song.videoId,
      cover: song.cover
    };

    console.log('Emitting addToQueue event with data:', {
      sessionId,
      song: songData
    });

    socketRef.current.emit('addToQueue', {
      sessionId,
      song: songData
    });
  };

  const playNext = () => {
    if (!socketRef.current?.connected) {
      console.error('Socket not connected');
      return;
    }

    console.log('Playing next song');
    socketRef.current.emit('playNext', { sessionId });
  };

  const removeFromQueue = (index) => {
    console.log('Removing song at index:', index);
    if (socketRef.current?.connected) {
      socketRef.current.emit('removeFromQueue', { sessionId, index });
    }
  };

  const reorderQueue = (startIndex, endIndex) => {
    console.log('Reordering queue:', { startIndex, endIndex });
    if (socketRef.current?.connected) {
      socketRef.current.emit('reorderQueue', { sessionId, startIndex, endIndex });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = songQueue.findIndex((song) => song.id === active.id);
      const newIndex = songQueue.findIndex((song) => song.id === over.id);
      
      console.log('Reordering queue:', { oldIndex, newIndex });
      reorderQueue(oldIndex, newIndex);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side - Song List */}
      <div className="w-[384px] flex-shrink-0 bg-white shadow-lg flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search songs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto">
          {songs.map((song) => (
            <div 
              key={song.id} 
              className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              onClick={() => addToQueue(song)}
            >
              <img src={song.cover} alt={song.title} className="w-12 h-12 rounded object-cover" />
              <div className="ml-4 flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{song.title}</div>
                <div className="text-sm text-gray-600 truncate">{song.artist}</div>
              </div>
              <MoreVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 p-2 grid grid-cols-5 gap-1">
          <div className="flex flex-col items-center py-2">
            <span className="text-xl mb-1">🎵</span>
            <span className="text-xs">Discover</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <Search className="w-5 h-5 mb-1" />
            <span className="text-xs">Search</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <Star className="w-5 h-5 mb-1" />
            <span className="text-xs">My Songs</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <Smartphone className="w-5 h-5 mb-1" />
            <span className="text-xs">Remote</span>
          </div>
          <div className="flex flex-col items-center py-2">
            <Settings className="w-5 h-5 mb-1" />
            <span className="text-xs">Settings</span>
          </div>
        </div>
      </div>

      {/* Right Side - Player and Queue */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Player Area */}
        <div className="flex-1 bg-gradient-to-br from-purple-800 to-purple-900 flex flex-col items-center justify-center relative">
          {/* YouTube Player */}
          <div className="absolute inset-0">
            <div className="w-full h-full">
              {currentVideoId && (
                <YouTubePlayer
                  videoId={currentVideoId}
                  isPlaying={isPlaying}
                  volume={volume}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnd={playNext}
                />
              )}
            </div>
          </div>
        </div>

        {/* Queue Section */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <span className="bg-pink-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">
                {songQueue.length}
              </span>
              <span className="font-medium">Song Queue</span>
              {isHost && (
                <span className="text-gray-600 text-sm ml-4">Session ID: {sessionId}</span>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={songQueue.map(song => song.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="inline-flex gap-4 pb-4 pr-4">
                  {songQueue.map((song, index) => (
                    <SortableItem
                      key={song.id}
                      song={song}
                      index={index}
                      isHost={isHost}
                      playNext={playNext}
                      removeFromQueue={() => removeFromQueue(index)}
                    />
                  ))}
                  <div className="flex-shrink-0 w-64 h-24 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                    <span className="text-gray-400">Add to queue</span>
                  </div>
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KaraokePlayer;
