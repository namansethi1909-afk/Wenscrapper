const axios = require('axios');
const cheerio = require('cheerio');

async function checkHQPorner() {
    const url = 'https://hqporner.com';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log(`Status: ${res.status}`);

        const $ = cheerio.load(res.data);
        const videos = $('a[href*="/hd-porn/"]');
        console.log(`Videos found: ${videos.length}`);

        if (videos.length > 0) {
            const first = $(videos[0]).attr('href');
            console.log(`Sample: ${first}`);
            const fullUrl = `https://hqporner.com${first}`;

            console.log(`Fetching details: ${fullUrl}`);
            const detail = await axios.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

            if (detail.data.match(/\.mp4/)) console.log('✅ Found MP4 match!');
            else console.log('❌ No MP4 found in details');
        }

    } catch (e) { console.error(e.message); }
}
checkHQPorner();
