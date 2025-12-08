const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeAnySex() {
    try {
        console.log('Fetching AnySex Home...');
        const res = await axios.get('https://anysex.com', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const firstVideo = $('a[href*="/videos/"]').first();
        const videoHref = firstVideo.attr('href');

        if (videoHref) {
            console.log('Found video:', videoHref);
            const fullUrl = videoHref.startsWith('http') ? videoHref : `https://anysex.com${videoHref}`;
            console.log('Fetching Details:', fullUrl);

            const detailRes = await axios.get(fullUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const detailHtml = detailRes.data;

            // Look for MP4
            const mp4 = detailHtml.match(/https?:\/\/[^"]+\.mp4/);
            if (mp4) console.log('✅ Found MP4:', mp4[0]);

            const source = detailHtml.match(/<source[^>]+src="([^"]+)"/);
            if (source) console.log('✅ Found source src:', source[1]);

            // Check for player config
            if (detailHtml.includes('video_url')) console.log('Found video_url in source');

        } else {
            console.log('❌ No videos found on home');
        }

    } catch (e) { console.error(e.message); }
}
analyzeAnySex();
