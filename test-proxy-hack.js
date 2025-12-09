const axios = require('axios');
const cheerio = require('cheerio');

async function testProxyHack() {
    const target = 'https://anysex.com';
    const proxyUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${target}`;

    try {
        console.log(`Fetching via Google Translate: ${proxyUrl}`);
        const res = await axios.get(proxyUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        console.log(`Status: ${res.status}`);

        const $ = cheerio.load(res.data);
        const links = $('a');
        console.log(`Total Links: ${links.length}`);

        let foundVideo = false;
        links.each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('anysex.com/videos/')) {
                // Google rewrites links, we expect them to be inside the query param 'u' or direct if script not running
                console.log(`Found original link pattern: ${href}`);
                foundVideo = true;
            }
        });

        if (!foundVideo) console.log('No direct video links found (might be rewritten)');

    } catch (e) { console.error(e.message); }
}
testProxyHack();
