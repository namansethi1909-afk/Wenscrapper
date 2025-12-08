const axios = require('axios');
const cheerio = require('cheerio');

async function recheckHClips() {
    try {
        console.log('Fetching hclips with headers...');
        const res = await axios.get('https://hclips.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'max-age=0'
            },
            timeout: 10000
        });

        console.log('Status:', res.status);
        console.log('Data Type:', typeof res.data);
        console.log('Length:', res.data.length);

        const $ = cheerio.load(res.data);
        const title = $('title').text();
        console.log('Title:', title);

        const firstA = $('a').first().attr('href');
        console.log('First Link:', firstA);

        const videoLinks = $('a[href*="/video/"]');
        console.log('Video Links:', videoLinks.length);

        // Check for scripts data
        if (videoLinks.length === 0) {
            console.log('Checking for scripts...');
            const scripts = $('script').length;
            console.log('Scripts found:', scripts);
        }
    } catch (e) { console.error(e.message); }
}
recheckHClips();
