import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  DragHandle as DragHandleIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ song, index, isHost, currentUser, canMove, onPlay, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: song.queueId,
    disabled: index === 0 || (!isHost && !canMove)
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        pl: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: isDragging ? 'action.hover' : song.playing ? 'primary.main' + '1A' : 'transparent',
        opacity: (!isHost && !canMove) ? 0.7 : 1,
        '&:hover': {
          bgcolor: song.playing ? 'primary.main' + '33' : 'action.hover',
          '& .drag-handle': {
            visibility: (isHost || canMove) && index !== 0 ? 'visible' : 'hidden',
          }
        },
      }}
    >
      {index !== 0 && (
        <Box
          {...attributes}
          {...listeners}
          sx={{
            display: 'flex',
            alignItems: 'center',
            visibility: isDragging ? 'visible' : 'hidden',
            cursor: (isHost || canMove) ? 'grab' : 'not-allowed',
          }}
          className="drag-handle"
        >
          <DragHandleIcon 
            sx={{ 
              color: (isHost || canMove) ? 'text.secondary' : 'text.disabled',
              mr: 1 
            }} 
          />
        </Box>
      )}

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body1"
              sx={{ 
                fontWeight: song.playing ? 'bold' : 'normal',
                color: song.playing ? 'primary.main' : 'inherit'
              }}
            >
              {song.title}
            </Typography>
          </Box>
        }
        secondary={
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: song.user === currentUser ? 'primary.main' : 'text.secondary',
            }}
          >
            {song.artist}
            {song.playing && (
              <Typography
                component="span"
                sx={{
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}
              >
                • Tocando
              </Typography>
            )}
            {index === 1 && !song.playing && (
              <Typography
                component="span"
                sx={{
                  color: 'info.main',
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}
              >
                • Próxima
              </Typography>
            )}
          </Typography>
        }
      />

      {isHost && (
        <IconButton
          size="small"
          onClick={() => onPlay(index)}
          sx={{ mr: 1 }}
        >
          <PlayArrowIcon />
        </IconButton>
      )}

      {(isHost || song.user === currentUser) && (
        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon />
        </IconButton>
      )}
    </ListItem>
  );
}

function SongQueue({ socket, sessionId, queue, currentUser }) {
  const onPlay = (index) => {
    if (socket?.connected) {
      socket.emit('playNext', { sessionId, index });
    }
  };

  const onRemove = (index) => {
    if (socket?.connected) {
      socket.emit('removeFromQueue', { sessionId, index });
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
      const newIndex = queue.findIndex(song => song.queueId === over.id);
      
      console.log('Movendo música:', {
        queueId: active.id,
        newIndex,
        songs: queue.map(s => ({ title: s.title, queueId: s.queueId }))
      });
      
      // onReorder(active.id, newIndex);
    }
  };

  // Função para verificar se uma música pode ser movida
  const canMoveSong = (index) => {
    const song = queue[index];
    if (song.user === currentUser) return true;

    // Verifica se tem músicas adjacentes do mesmo usuário
    const prevSong = index > 0 ? queue[index - 1] : null;
    const nextSong = index < queue.length - 1 ? queue[index + 1] : null;
    return (prevSong && prevSong.user === currentUser) || (nextSong && nextSong.user === currentUser);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" component="div">
          Fila de Músicas ({queue.length})
        </Typography>
      </Box>
      
      <Box sx={{ 
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <List
            sx={{
              flex: 1,
              overflow: 'auto',
              overscrollBehavior: 'contain',
              minHeight: 0,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.3)',
                },
              },
            }}
          >
            <SortableContext 
              items={queue.map(song => song.queueId)}
              strategy={verticalListSortingStrategy}
            >
              {queue.map((song, index) => (
                <SortableItem
                  key={song.queueId}
                  song={song}
                  index={index}
                  isHost={false}
                  currentUser={currentUser}
                  canMove={canMoveSong(index) || index === 0}
                  onPlay={onPlay}
                  onRemove={onRemove}
                />
              ))}
            </SortableContext>
          </List>
        </DndContext>
      </Box>
    </Paper>
  );
}

export default SongQueue;
