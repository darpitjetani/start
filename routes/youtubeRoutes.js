// Assuming Express and necessary modules are already imported
const express = require('express');
const router = express.Router();
const { saveYoutubeLink, getYoutubeLinks, deleteYouTubeLink } = require('../controllers/youtubeController');

// POST route to upload the YouTube link
router.post('/uploadYoutubeLink', saveYoutubeLink);

// GET route to fetch YouTube links
router.get('/getYoutubeLinks', getYoutubeLinks);

router.delete('/deleteLink/:id', deleteYouTubeLink);

module.exports = router;
