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
        thumbnailUrl: 'https://example.com/thumbnail1.jpg',
        karaokeUrl: 'https://example.com/karaoke1.mp4'
    },
    {
        id: '2',
        title: 'Yesterday',
        artist: 'The Beatles',
        duration: '2:55',
        language: 'EN',
        thumbnailUrl: 'https://example.com/thumbnail2.jpg',
        karaokeUrl: 'https://example.com/karaoke2.mp4'
    },
    {
        id: '3',
        title: 'Evidências',
        artist: 'Chitãozinho & Xororó',
        duration: '4:20',
        language: 'PT-BR',
        thumbnailUrl: 'https://example.com/thumbnail3.jpg',
        karaokeUrl: 'https://example.com/karaoke3.mp4'
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

// Get song by ID with lyrics
router.get('/:id', (req, res) => {
    const song = songs.find(s => s.id === req.params.id);
    if (!song) {
        return res.status(404).json({ error: 'Song not found' });
    }

    const songLyrics = lyrics[song.id];
    if (!songLyrics) {
        return res.status(404).json({ error: 'Lyrics not found' });
    }

    res.json({
        ...song,
        lyrics: songLyrics.lines,
        videoUrl: songLyrics.videoUrl,
        audioUrl: songLyrics.audioUrl
    });
});

module.exports = router;
