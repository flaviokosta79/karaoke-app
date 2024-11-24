const ytdl = require('ytdl-core');
const getPlaylist = require('youtube-playlist-summary');

const config = {
  PLAYLIST_ITEM_KEY: ['title', 'videoUrl', 'videoId', 'description']
};

async function getVideoInfo(videoId) {
  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    return {
      id: videoId,
      type: 'youtube',
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      duration: parseInt(info.videoDetails.lengthSeconds) * 1000,
      videoId: videoId,
      thumbnailUrl: info.videoDetails.thumbnails[0].url
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw error;
  }
}

async function extractPlaylistId(url) {
  const regex = /[&?]list=([^&]+)/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function getPlaylistVideos(playlistUrl) {
  try {
    const playlistId = await extractPlaylistId(playlistUrl);
    if (!playlistId) {
      throw new Error('Invalid playlist URL');
    }

    const playlist = new getPlaylist(config);
    const result = await playlist.getPlaylistItems(playlistId);
    
    // Transformar os resultados no formato que precisamos
    return result.items.map(item => ({
      id: item.videoId,
      type: 'youtube',
      title: item.title,
      videoId: item.videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${item.videoId}/default.jpg`
    }));
  } catch (error) {
    console.error('Error getting playlist:', error);
    throw error;
  }
}

module.exports = {
  getVideoInfo,
  getPlaylistVideos,
  extractPlaylistId
};
