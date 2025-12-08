const axios = require('axios');
const cheerio = require('cheerio');

async function inspectCandidates() {
    const sites = [
        'https://motherless.com',
        'https://thisvid.com',
        'https://pornhub.com', // Just to check if MAJOR ones work
        'https://xvideos.com'
    ];

    console.log('Inspecting robust candidates...\n');

    for (const url of sites) {
        try {
            console.log(`Fetching ${url}...`);
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                timeout: 10000
            });

            const $ = cheerio.load(res.data);
            const title = $('title').text().trim();
            console.log(`✅ ${url}`);
            console.log(`   Title: ${title}`);
            console.log(`   Links: ${$('a').length}`);

            // Check for video links
            const videoLinks = $('a[href*="/video/"], a[href*="/view/"]').length;
            console.log(`   Video Links: ${videoLinks}`);

            if (videoLinks > 0) console.log('   🎯 WINNER!');

        } catch (e) {
            console.log(`❌ ${url} - ${e.message}`);
        }
        console.log('---');
    }
}
inspectCandidates();
