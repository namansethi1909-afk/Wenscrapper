const axios = require('axios');
const cheerio = require('cheerio');

async function testScraperLogic() {
    const baseUrl = "https://thisvid.com";
    try {
        console.log('Fetching ThisVid...');
        const { data } = await axios.get(baseUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Referer": "https://thisvid.com/"
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const results = [];
        const videoLinks = $('a[href*="/videos/"]');

        console.log(`Found ${videoLinks.length} links with /videos/`);

        videoLinks.each((_, el) => {
            const $el = $(el);
            const img = $el.find('img');

            // Logic form scraper:
            // if (img.length === 0 && !$el.hasClass('video-thumb') && !$el.parent().hasClass('video-thumb')) { return; }

            const href = $el.attr('href') || "";
            if (!href.includes('/videos/') || href.includes('/videos/best/')) return;

            const idMatch = href.match(/\/videos\/([^\/]+)\/?/);
            const id = idMatch ? idMatch[1] : "";
            if (!id) return;

            const title = $el.attr('title') || img.attr('alt') || $el.text().trim() || "Untitled";
            if (!title || title.length < 2) return;

            // Debug print
            if (results.length < 3) console.log(`Potential Item: ${id} - ${title}`);

            let poster = img.attr('src') || img.attr('data-src') || "";
            if (poster.startsWith('//')) poster = 'https:' + poster;

            if (results.find(r => r.id === id)) return;

            results.push({ id, title, poster, page: href });
        });

        console.log(`Parsed ${results.length} videos`);
        console.log(JSON.stringify(results.slice(0, 2), null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}
testScraperLogic();
