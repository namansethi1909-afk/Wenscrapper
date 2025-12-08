const axios = require('axios');
const cheerio = require('cheerio');

async function checkTnaFlix() {
    const url = 'https://www.tnaflix.com';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log('Status:', res.status);

        const $ = cheerio.load(res.data);
        const videos = $('.video_box'); // TnaFlix uses video_box
        console.log(`Videos found: ${videos.length}`);

        if (videos.length > 0) {
            console.log('Sample found');
        } else {
            // Try searching for any links
            console.log('Total Links:', $('a').length);
        }
    } catch (e) { console.error(e.message); }
}
checkTnaFlix();
