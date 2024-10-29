const mongoose = require('mongoose');

const YouTubeLinkSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true,
        unique: true // Prevents duplicate links
    }
});

const YouTubeLink = mongoose.model('YouTubeLink', YouTubeLinkSchema);

module.exports = YouTubeLink;
