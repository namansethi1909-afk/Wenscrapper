const axios = require('axios');
const cheerio = require('cheerio');

async function checkCandidates() {
    const sites = [
        'https://txxx.com',
        'https://upornia.com',
        'https://www.realporn3d.com',
        'https://www.anysex.com'
    ];

    console.log('Checking fallback candidates...\n');

    for (const url of sites) {
        try {
            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 8000
            });
            console.log(`✅ ${url} - Status: ${res.status}`);

            const $ = cheerio.load(res.data);
            const title = $('title').text();
            console.log(`   Title: ${title}`);
            console.log(`   Links: ${$('a').length}`);

            const videos = $('a[href*="video"]');
            console.log(`   Video Links: ${videos.length}`);

            if (videos.length > 0) {
                console.log(`   Sample: ${$(videos[0]).attr('href')}`);
            }

        } catch (e) {
            console.log(`❌ ${url} - ${e.message}`);
        }
        console.log('---');
    }
}
checkCandidates();
