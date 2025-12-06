const { FsiBlog } = require('./src/scrapper/fsiblog.scrapper');
const axios = require('axios');
const cheerio = require('cheerio');

async function debugFsiPage() {
    const scraper = new FsiBlog();
    console.log('Searching FsiBlog for "Desi Tamil Wife"...');
    try {
        const results = await scraper.getSearch('Desi Tamil Wife');
        if (results.length === 0) {
            console.log('No results.');
            return;
        }
        const video = results[0];
        console.log('Video:', video.title, video.page);

        // Fetch Page HTML
        console.log('Fetching HTML...');
        const { data } = await axios.get(video.page, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // 1. Check Iframes
        $('iframe').each((i, el) => {
            console.log(`Iframe ${i}:`, $(el).attr('src'));
        });

        // 2. Check Video Tags
        $('video source').each((i, el) => {
            console.log(`Video Source ${i}:`, $(el).attr('src'));
        });

        // 3. Check Scripts for "sources"
        $('script').each((i, el) => {
            const html = $(el).html();
            if (html && html.includes('sources')) {
                console.log('Found script with "sources":', html.substring(0, 100) + '...');
            }
            if (html && html.includes('.mp4')) {
                console.log('Found script with .mp4');
            }
        });

    } catch (e) { console.error('Error:', e); }
}

debugFsiPage();
