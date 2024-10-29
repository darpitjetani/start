const YoutubeLink = require('../models/youtubeLinkModel'); // Create this model


const saveYoutubeLink = async (req, res) => {
    const { link } = req.body;
    console.log('Received link:', link); // Log the received link

    // Updated regex pattern to support both regular YouTube videos and Shorts
    const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|shorts\/|.+\?v=)?([^&\n]{11})/;

    // Validate YouTube link
    if (!youtubeRegex.test(link)) {
        console.log('Invalid link format'); // Log invalid link format
        return res.status(400).json({ message: 'Invalid YouTube link' });
    }

    // If valid, proceed to save the link
    try {
        const newLink = new YoutubeLink({ link }); // Create a new instance of the model
        await newLink.save(); // Save to database
        return res.status(200).json({ message: 'YouTube link uploaded successfully' });
    } catch (error) {
        console.error('Error saving YouTube link:', error); // Log the error
        return res.status(500).json({ message: 'Error saving YouTube link' });
    }
};



// Retrieve all YouTube links
const getYoutubeLinks = async (req, res) => {
    try {
        const Links = await YoutubeLink.find();
        res.status(200).json(Links);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving YouTube links', error });
    }
};

const deleteYouTubeLink = async (req, res) => {
        const { id } = req.params;
    
        try {
            const link = await YouTubeLink.findById(id);
            if (!link) {
                return res.status(404).json({ success: false, message: 'YouTube link not found.' });
            }
    
            await YouTubeLink.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'YouTube link deleted successfully.' });
        } catch (error) {
            console.error('Error deleting YouTube link:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
    };

module.exports = { saveYoutubeLink, getYoutubeLinks, deleteYouTubeLink };




