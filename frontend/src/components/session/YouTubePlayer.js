import React, { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

function YouTubePlayer({ videoId, onEnd, onPlay, onPause, isPlaying }) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      fs: 1, // Permite fullscreen
      cc_load_policy: 0, // Desativa legendas por padrão
      iv_load_policy: 3, // Remove anotações
      playsinline: 1,
      showinfo: 0,
      origin: window.location.origin,
    },
  };

  const onReady = (event) => {
    playerRef.current = event.target;
    const iframe = event.target.getIframe();
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
  };

  const onStateChange = (event) => {
    switch (event.data) {
      case YouTube.PlayerState.ENDED:
        if (onEnd) onEnd();
        break;
      case YouTube.PlayerState.PLAYING:
        if (onPlay) onPlay();
        break;
      case YouTube.PlayerState.PAUSED:
        if (onPause) onPause();
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full h-full">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        className="absolute inset-0"
        containerClassName="absolute inset-0"
      />
    </div>
  );
}

export default YouTubePlayer;
