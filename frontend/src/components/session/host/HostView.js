import React from 'react';
import KaraokePlayer from '../KaraokePlayer';

function HostView({ socket, sessionId, currentSong }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <KaraokePlayer
        socket={socket}
        sessionId={sessionId}
        isHost={true}
        currentSong={currentSong}
      />
    </div>
  );
}

export default HostView;
