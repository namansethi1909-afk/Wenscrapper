const axios = require('axios');
const cheerio = require('cheerio');

async function inspectTubePornClassic() {
    try {
        console.log('Fetching tubepornclassic...');
        const res = await axios.get('https://tubepornclassic.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://google.com'
            }
        });

        const $ = cheerio.load(res.data);
        console.log('Title:', $('title').text());

        // Try various common selectors
        console.log('Class "video":', $('.video').length);
        console.log('Class "item":', $('.item').length);
        console.log('Class "thumb":', $('.thumb').length);
        console.log('Links with /watch/:', $('a[href*="/watch/"]').length);

        if ($('a[href*="/watch/"]').length > 0) {
            console.log('✅ Found usable links!');
            const first = $('a[href*="/watch/"]').first();
            console.log('Href:', first.attr('href'));
            console.log('Title:', first.attr('title') || first.text());
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}
inspectTubePornClassic();
