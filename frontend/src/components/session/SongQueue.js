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
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function SongQueue({ songs = [], onRemove, onReorder, onPlay, isHost, currentUser, isMobile }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  // Função para verificar se uma música pode ser movida
  const canMoveSong = (index) => {
    if (isHost) return true;
    const song = songs[index];
    if (song.user !== currentUser) return false;

    // Verifica se tem músicas adjacentes do mesmo usuário
    const prevSong = index > 0 ? songs[index - 1] : null;
    const nextSong = index < songs.length - 1 ? songs[index + 1] : null;
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
        overflow: 'hidden', // Importante para conter o scroll
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
          <Droppable droppableId="songQueue">
            {(provided) => (
              <List
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  overscrollBehavior: 'contain', // Previne scroll propagation
                  minHeight: 0, // Importante para o flex container
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
                {songs.map((song, index) => {
                  const isCurrentUserSong = song.user === currentUser;
                  const canMove = canMoveSong(index);

                  return (
                    <Draggable
                      key={`song-${song.id}-${index}`}
                      draggableId={`song-${song.id}-${index}`}
                      index={index}
                      isDragDisabled={!isHost && !canMove}
                    >
                      {(provided, snapshot) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            pl: 1,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: snapshot.isDragging ? 'action.hover' : 'transparent',
                            opacity: (!isHost && !canMove) ? 0.7 : 1,
                            '&:hover': {
                              bgcolor: 'action.hover',
                              '& .drag-handle': {
                                visibility: (isHost || canMove) ? 'visible' : 'hidden',
                              }
                            },
                          }}
                        >
                          <Box
                            {...provided.dragHandleProps}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              visibility: snapshot.isDragging ? 'visible' : 'hidden',
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

                          <ListItemText
                            primary={song.title}
                            secondary={
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: isCurrentUserSong ? 'primary.main' : 'text.secondary',
                                }}
                              >
                                {song.artist} • {song.user}
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

                          {(isHost || isCurrentUserSong) && (
                            <IconButton
                              size="small"
                              onClick={() => onRemove(index)}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </ListItem>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Paper>
  );
}

export default SongQueue;
