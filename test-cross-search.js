const { HardGif } = require('./src/scrapper/hardgif.scrapper');

async function testCrossSearch() {
    const scraper = new HardGif();
    const queries = [
        'desi-girl-shows-boobs-50', // Slug style
        'Desi Girl Shows Boobs',    // Title style
        'desi'                      // Generic
    ];

    for (const q of queries) {
        console.log(`\nSearching HardGif for: "${q}"`);
        try {
            const results = await scraper.getSearch(q);
            console.log(`Found ${results.length} results.`);
            if (results.length > 0) {
                console.log('Top Match:', results[0].title, '| ID:', results[0].id);
            }
        } catch (e) { console.error('Error:', e.message); }
    }
}

testCrossSearch();
