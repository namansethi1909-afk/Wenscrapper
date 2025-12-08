const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeThisVid() {
    try {
        console.log('Fetching ThisVid...');
        const res = await axios.get('https://thisvid.com', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const $ = cheerio.load(res.data);
        const links = $('a');
        console.log('Total links:', links.length);

        // Print first 10 hrefs to see pattern
        console.log('Sample patterns:');
        links.slice(0, 10).each((i, el) => {
            console.log($(el).attr('href'));
        });

        // Search for "video" keyword in hrefs
        const videoLinks = $('a[href*="/videos/"]');
        console.log('Links with /videos/:', videoLinks.length);

        if (videoLinks.length > 0) {
            console.log('Example video link:', $(videoLinks[0]).attr('href'));
        }

    } catch (e) { console.error(e); }
}
analyzeThisVid();
