const axios = require('axios');
const cheerio = require('cheerio');

// Run this on user machine to see what REAL structure looks like
async function analyzeAnySexDeep() {
    try {
        console.log('Fetching AnySex...');
        const res = await axios.get('https://anysex.com', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const links = $('a[href*="/videos/"]');
        console.log(`Deep Analysis: Found ${links.length} video links`);

        // Print first 5 hrefs exactly
        links.slice(0, 5).each((i, el) => {
            console.log(`[${i}] ${$(el).attr('href')}`);
        });

    } catch (e) {
        console.error(e.message);
    }
}
analyzeAnySexDeep();
