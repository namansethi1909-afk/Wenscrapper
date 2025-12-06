const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    try {
        const res = await axios.get('https://www.fsiblog.cc/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(res.data);

        const items = $('#ajax_content ul.video_list li.video');
        console.log('Found items:', items.length);

        items.slice(0, 5).each((i, el) => {
            const $el = $(el);
            const aTitle = $el.find('a.title');
            const aThumb = $el.find('a.thumb');
            const href = aTitle.attr('href') || aThumb.attr('href') || '';
            const title = (aTitle.text() || aThumb.attr('title') || '').trim();
            console.log(`Video ${i + 1}: href="${href}" title="${title}"`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
