const axios = require('axios');
const cheerio = require('cheerio');

async function inspectHClips() {
    try {
        console.log('Fetching hclips...');
        const res = await axios.get('https://hclips.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://google.com'
            }
        });

        const $ = cheerio.load(res.data);
        console.log('Title:', $('title').text());

        const articles = $('article');
        const videos = $('.video-item');
        const items = $('.item');
        const links = $('a[href*="/video/"]');

        console.log('Articles:', articles.length);
        console.log('Video items:', videos.length);
        console.log('Items:', items.length);
        console.log('Video Links:', links.length);

        if (links.length > 0) {
            console.log('First link:', $(links[0]).attr('href'));
            console.log('First Title:', $(links[0]).attr('title'));
        }

    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.log('Status:', e.response.status);
    }
}
inspectHClips();
