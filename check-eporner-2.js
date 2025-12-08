const axios = require('axios');
const cheerio = require('cheerio');

async function checkEporner() {
    const url = 'https://www.eporner.com';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log(`Status: ${res.status}`);

        const $ = cheerio.load(res.data);
        const videos = $('.mb'); // Eporner uses .mb for video blocks often
        console.log(`Videos found: ${videos.length}`); // Or look for .hdy

        if (videos.length > 0) {
            // Eporner details logic
        }
    } catch (e) { console.error(e.message); }
}
checkEporner();
