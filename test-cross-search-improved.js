const { HardGif } = require('./src/scrapper/hardgif.scrapper');

async function testCrossSearchImproved() {
    const scraper = new HardGif();
    const slug = 'desi-girl-shows-boobs-50';

    // Strategy 1: Raw Slug
    console.log(`\n1. Searching Raw Slug: "${slug}"`);
    try {
        const r1 = await scraper.getSearch(slug);
        console.log(`Found: ${r1.length}`);
    } catch (e) { console.log('Failed'); }

    // Strategy 2: Normalized (Spaces)
    const normalized = slug.replace(/-/g, ' ');
    console.log(`\n2. Searching Normalized: "${normalized}"`);
    try {
        const r2 = await scraper.getSearch(normalized);
        console.log(`Found: ${r2.length}`);
        if (r2.length > 0) {
            console.log('Top Match:', r2[0].title, 'ID:', r2[0].id);
        }
    } catch (e) { console.log('Failed'); }
}

testCrossSearchImproved();
