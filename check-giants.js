const axios = require('axios');
const cheerio = require('cheerio');

async function checkPornGiants() {
    const sites = [
        { url: 'https://www.xnxx.com', name: 'XNXX' },
        { url: 'https://www.xvideos.com', name: 'XVideos' }
    ];

    for (const site of sites) {
        try {
            console.log(`Checking ${site.name} (${site.url})...`);
            const res = await axios.get(site.url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                },
                timeout: 10000
            });
            console.log(`✅ ${site.name} Status: ${res.status}`);

            // Extract a video link
            const $ = cheerio.load(res.data);
            const thumb = $('.thumb-block').first();
            const link = thumb.find('a').attr('href');

            if (link) {
                const fullUrl = `${site.url}${link}`; // Usually relative
                console.log(`Deep Checking: ${fullUrl}`);
                const vidRes = await axios.get(fullUrl, { timeout: 10000 });
                const html = vidRes.data;

                // Check for html5player.setVideoUrlHigh or similar
                if (html.includes('currentVideoUrlHigh') || html.includes('setVideoUrlHigh')) {
                    console.log(`✅ ${site.name} MP4 method found!`);
                } else if (html.match(/\.mp4/)) {
                    console.log(`✅ ${site.name} Generic MP4 found!`);
                } else {
                    console.log(`❌ ${site.name} No obvious MP4 pattern.`);
                }
            } else {
                console.log(`❌ ${site.name} No video links found on home.`);
            }

        } catch (e) {
            console.log(`❌ ${site.name} Failed: ${e.message}`);
        }
        console.log('---');
    }
}
checkPornGiants();
