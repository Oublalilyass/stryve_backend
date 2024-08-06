const axios = require('axios');
const cheerio = require('cheerio');

async function fetchWebsiteContent(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    return $('body').text(); // Extract text from body
  } catch (error) {
    console.error('Error fetching website content:', error);
    return null;
  }
}

module.exports = fetchWebsiteContent;
