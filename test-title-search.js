const { HardGif } = require('./src/scrapper/hardgif.scrapper');

async function testTitleSearch() {
    const scraper = new HardGif();
    // Title from user screenshot
    const title = "Desi Tamil Wife Blowjob and Fucking";

    console.log(`\nSearching Title: "${title}"`);
    try {
        const results = await scraper.getSearch(title);
        console.log(`Found: ${results.length}`);
        if (results.length > 0) {
            console.log('Top Match:', results[0].title);
            console.log('ID:', results[0].id);
        } else {
            console.log('No exact match. Trying fuzzy...');
            // Try removing last word
            const shortTitle = title.split(' ').slice(0, 3).join(' ');
            console.log(`Searching Short: "${shortTitle}"`);
            const r2 = await scraper.getSearch(shortTitle);
            console.log(`Found: ${r2.length}`);
            if (r2.length > 0) console.log('Top:', r2[0].title);
        }
    } catch (e) { console.log('Failed', e); }
}

testTitleSearch();
