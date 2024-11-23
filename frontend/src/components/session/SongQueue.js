import React, { useEffect, useState } from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Stack,
  alpha,
  Box
} from '@mui/material';
import {
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const DroppableComponent = React.memo(({ children }) => {
  return (
    <Droppable droppableId="songQueue">
      {(provided, snapshot) => (
        <List
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '400px',
            position: 'relative',
            '& > *': {
              // Garante que todos os itens permaneçam visíveis
              position: 'relative',
              zIndex: 1
            },
            // Estilo do scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme => alpha(theme.palette.primary.main, 0.2),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme => alpha(theme.palette.primary.main, 0.3),
            }
          }}
        >
          {children}
          {provided.placeholder}
        </List>
      )}
    </Droppable>
  );
});

const DraggableItem = React.memo(({ song, index, isHost, currentUser, onRemove, onPlay, isMobile }) => {
  // Host pode gerenciar todas as músicas, usuário normal só as próprias
  const canManage = isHost || song.user === currentUser;
  // Host pode arrastar qualquer música, usuário normal só as próprias
  const canDrag = isHost || song.user === currentUser;

  return (
    <Draggable
      draggableId={`song-${song.id}-${index}`}
      index={index}
      isDragDisabled={!canDrag}
    >
      {(provided, snapshot) => (
        <ListItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            py: isMobile ? 2 : 1,
            position: 'relative',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            borderRadius: '8px',
            margin: '4px 0',
            border: theme => `1px solid ${snapshot.isDragging ? theme.palette.primary.main : 'transparent'}`,
            backgroundColor: theme => {
              if (snapshot.isDragging) {
                return alpha(theme.palette.primary.main, 0.1);
              }
              return canDrag ? 'background.paper' : 'background.default';
            },
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: theme => canDrag ? alpha(theme.palette.primary.main, 0.05) : 'background.default',
            },
            boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
            // Garante que o item arrastado fique sempre visível
            zIndex: snapshot.isDragging ? 1000 : 1
          }}
        >
          <div {...provided.dragHandleProps} style={{ 
            cursor: canDrag ? 'grab' : 'default',
            opacity: canDrag ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            // Mantém o ícone de arrasto sempre visível
            position: 'relative',
            zIndex: 2
          }}>
            <DragIndicatorIcon 
              sx={{ 
                mr: 2,
                color: theme => canDrag 
                  ? snapshot.isDragging 
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary
                  : theme.palette.text.disabled,
                transform: snapshot.isDragging ? 'rotate(-5deg) scale(1.1)' : 'none',
                transition: 'all 0.2s ease'
              }} 
            />
          </div>
          <ListItemText 
            primary={song.title}
            secondary={
              <Typography variant="body2" component="span">
                {song.artist} • Adicionado por <strong>{song.user}</strong>
              </Typography>
            }
            sx={{
              m: 0,
              flex: 1,
              '& .MuiListItemText-primary': {
                fontWeight: snapshot.isDragging ? 500 : 400,
                color: snapshot.isDragging ? 'primary.main' : 'text.primary',
                // Mantém o texto sempre visível
                position: 'relative',
                zIndex: 2
              }
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            ml: 'auto',
            opacity: snapshot.isDragging ? 0.5 : 1,
            // Mantém os botões sempre visíveis
            position: 'relative',
            zIndex: 2
          }}>
            {canManage && (
              <IconButton
                onClick={() => onRemove(index)}
                size="small"
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: theme => alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            {isHost && (
              <IconButton
                onClick={() => onPlay(index)}
                size="small"
                sx={{
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: theme => alpha(theme.palette.success.main, 0.1)
                  }
                }}
              >
                <PlayArrowIcon />
              </IconButton>
            )}
          </Box>
        </ListItem>
      )}
    </Draggable>
  );
});

const SongQueue = ({ songs = [], onRemove, onReorder, onPlay, isHost, currentUser, isMobile }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    onReorder(sourceIndex, destinationIndex);
  };

  if (!mounted) return null;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: '100%', 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: isMobile ? 300 : 400, // Altura mínima consistente
        maxHeight: isMobile ? '50vh' : '70vh' // Altura máxima responsiva
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
          Fila de Músicas ({songs.length})
        </Typography>
      </Box>
      
      <Box sx={{ 
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <DroppableComponent>
            {songs.map((song, index) => (
              <DraggableItem
                key={`${song.id}-${index}`}
                song={song}
                index={index}
                isHost={isHost}
                currentUser={currentUser}
                onRemove={onRemove}
                onPlay={onPlay}
                isMobile={isMobile}
              />
            ))}
          </DroppableComponent>
        </DragDropContext>
      </Box>
    </Paper>
  );
};

export default React.memo(SongQueue);
