const axios = require('axios');
const cheerio = require('cheerio');

async function checkMobileXhamster() {
    const url = 'https://m.xhamster.com';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Mobile Safari/537.36'
            },
            timeout: 10000
        });
        console.log('Status:', res.status);

        const $ = cheerio.load(res.data);
        const videos = $('a[href*="/videos/"]');
        console.log(`Videos found: ${videos.length}`);

        if (videos.length > 0) {
            console.log(`Sample: ${$(videos[0]).attr('href')}`);
            // Check details page
            const dUrl = $(videos[0]).attr('href');
            const detailRes = await axios.get(dUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960U)' }
            });
            if (detailRes.data.includes('.mp4')) console.log('✅ Found .mp4 in details');
        }
    } catch (e) { console.error(e.message); }
}
checkMobileXhamster();
