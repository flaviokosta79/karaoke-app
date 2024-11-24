const express = require('express');
const router = express.Router();
const path = require('path');
const { getLyrics } = require('../data/lyrics');
const youtubeService = require('../services/youtubeService');

// Mock data for songs (later this can be moved to a database)
const songs = [
    {
        id: 'garota-de-ipanema',
        title: 'Garota de Ipanema',
        artist: 'Tom Jobim',
        duration: '3:45',
        language: 'PT-BR',
        thumbnailUrl: '/songs/garota-de-ipanema.jpg',
        audioUrl: '/songs/garota-de-ipanema.mp3',
        type: 'local'
    }
];

// Get all songs
router.get('/', (req, res) => {
    const songs = [
        {
            id: 'garota-de-ipanema',
            title: 'Garota de Ipanema',
            artist: 'Tom Jobim',
            thumbnailUrl: '/songs/garota-de-ipanema.jpg',
            audioUrl: '/songs/garota-de-ipanema.mp3',
            type: 'local'
        }
    ];
    res.json(songs);
});

// Search songs
router.get('/search', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.json(songs);
    }

    const filteredSongs = songs.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase())
    );

    res.json(filteredSongs);
});

// Get song lyrics
router.get('/:id/lyrics', (req, res) => {
    const songId = req.params.id;
    const lyrics = getLyrics(songId);
    res.json(lyrics);
});

// Get YouTube video info
router.get('/youtube/:videoId', async (req, res) => {
    try {
        const videoInfo = await youtubeService.getVideoInfo(req.params.videoId);
        res.json(videoInfo);
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({ error: 'Failed to get video info' });
    }
});

// Get YouTube playlist videos
router.post('/youtube/playlist', async (req, res) => {
    try {
        const { playlistUrl } = req.body;
        if (!playlistUrl) {
            return res.status(400).json({ error: 'Playlist URL is required' });
        }

        const videos = await youtubeService.getPlaylistVideos(playlistUrl);
        res.json(videos);
    } catch (error) {
        console.error('Error getting playlist videos:', error);
        res.status(500).json({ error: 'Failed to get playlist videos' });
    }
});

module.exports = router;
