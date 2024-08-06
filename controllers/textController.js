const Text = require('../models/Text');
const crypto = require('crypto');
const fetchWebsiteContent = require('../utils/crawler');

function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

exports.createText = async (req, res) => {
  try {
    const { content } = req.body;
    const paragraphs = content.split('\n');
    const hashes = paragraphs.map(generateHash);

    const duplicateHashes = [];
    for (let hash of hashes) {
      const existingText = await Text.findOne({ where: { hash } });
      if (existingText) {
        duplicateHashes.push(hash);
      }
    }

    if (duplicateHashes.length > 0) {
      return res.status(409).json({ message: 'Duplicate content detected', duplicates: duplicateHashes });
    }

    const text = await Text.create({ content, hash: generateHash(content) });
    res.status(201).json(text);
  } catch (error) {
    console.error('Error creating text:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getText = async (req, res) => {
  try {
    const texts = await Text.findAll();
    res.status(200).json(texts);
  } catch (error) {
    console.error('Error fetching texts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTextByUUID = async (req, res) => {
  try {
    const text = await Text.findOne({ where: { id: req.params.uuid } });
    if (!text) {
      return res.status(404).json({ message: 'Text entry not found' });
    }
    res.json(text);

    // if (req.session.userType === 'Writer') {
    //   // Return data for Writer session
    //   res.json({ text, sessionType: 'Writer' });
    // } else if (req.session.userType === 'Publisher') {
    //   // Return data for Publisher session
    //   res.json({ text, sessionType: 'Publisher' });
    // } else {
    //   res.status(400).json({ message: 'Invalid session type' });
    // }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the text entry' });
  }
};


exports.compareCrawledContent = async (req, res) => {
  try {
    const { url } = req.body;
    const crawledContent = await fetchWebsiteContent(url);

    if (!crawledContent) {
      return res.status(500).json({ error: 'Failed to fetch website content' });
    }

    const paragraphs = crawledContent.split('\n');
    const hashes = paragraphs.map(generateHash);

    const duplicateHashes = [];
    for (let hash of hashes) {
      const existingText = await Text.findOne({ where: { hash } });
      if (existingText) {
        duplicateHashes.push(hash);
      }
    }

    res.status(200).json({ duplicates: duplicateHashes });
  } catch (error) {
    console.error('Error comparing crawled content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
