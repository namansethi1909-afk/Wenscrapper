const cheerio = require('cheerio');

const BASE_URL = 'https://masa49.org';

async function analyze() {
    try {
        const { gotScraping } = await import('got-scraping');

        console.log(`Fetching ${BASE_URL} with got-scraping...`);
        const { body: homeHtml } = await gotScraping({ url: BASE_URL });

        console.log('Home HTML length:', homeHtml.length);
        const $ = cheerio.load(homeHtml);

        console.log('Boxes found:', $('.box').length);

        // Try to find first link in a box
        let firstLink = $('.box a').first().attr('href');
        if (!firstLink) firstLink = $('.posts a').first().attr('href');
        if (!firstLink) firstLink = $('.title a').first().attr('href');

        console.log('First Video Link:', firstLink);

        if (firstLink) {
            console.log(`Fetching details: ${firstLink}...`);
            const { body: detailHtml } = await gotScraping({ url: firstLink });

            console.log('Detail page fetched.');
            const $d = cheerio.load(detailHtml);

            // Look for video players
            const videos = [];
            $d('video source').each((i, el) => videos.push($d(el).attr('src')));
            $d('iframe').each((i, el) => videos.push($d(el).attr('src')));

            console.log('Found video sources:', videos);

            // Check scripts
            const scripts = $d('script').text();
            const m3u8 = scripts.match(/https?:\/\/[^"']+\.m3u8/g);
            const mp4 = scripts.match(/https?:\/\/[^"']+\.mp4/g);
            if (m3u8) console.log('Found m3u8 in script:', m3u8);
            if (mp4) console.log('Found mp4 in script:', mp4);

            // Check generic video match
            const generic = scripts.match(/file\s*:\s*["']([^"']+)["']/);
            if (generic) console.log('Found generic file match:', generic[1]);
        }

        // Verify Search
        const searchUrl = `${BASE_URL}/?s=desi`;
        console.log(`Testing search: ${searchUrl}...`);
        const { body: searchHtml } = await gotScraping({ url: searchUrl });
        const $s = cheerio.load(searchHtml);
        console.log('Search results found:', $s('.box').length);

    } catch (e) {
        console.error('Error:', e.message);
    }
}

analyze();
