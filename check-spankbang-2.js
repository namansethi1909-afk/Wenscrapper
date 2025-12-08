const axios = require('axios');
const cheerio = require('cheerio');

async function checkSpankBang() {
    const url = 'https://spankbang.com';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log(`Status: ${res.status}`);

        const $ = cheerio.load(res.data);
        const videos = $('a.thumb'); // common selector
        console.log(`Videos found: ${videos.length}`);

        if (videos.length > 0) {
            const first = $(videos[0]).attr('href');
            console.log(`Sample: ${first}`);
        }
    } catch (e) { console.error(e.message); }
}
checkSpankBang();
