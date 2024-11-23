const express = require('express');
const router = express.Router();
const lyrics = require('../data/lyrics');

// Mock data for songs (later this can be moved to a database)
const songs = [
    {
        id: '1',
        title: 'Garota de Ipanema',
        artist: 'Tom Jobim',
        duration: '3:45',
        language: 'PT-BR',
        thumbnailUrl: '/songs/garota-de-ipanema.jpg',
        audioUrl: '/songs/garota-de-ipanema.mp3'
    }
];

// Get all songs
router.get('/', (req, res) => {
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
    const songLyrics = lyrics[req.params.id];
    if (!songLyrics) {
        return res.status(404).json({ error: 'Lyrics not found' });
    }
    res.json(songLyrics);
});

module.exports = router;
