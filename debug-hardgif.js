const { HardGif } = require('./src/scrapper/hardgif.scrapper');

async function debugHardGif() {
    const scraper = new HardGif();
    console.log('Testing HardGif Search...');
    try {
        const results = await scraper.getSearch('desi');
        console.log('Results:', results);
    } catch (error) {
        console.error('HardGif Failed:', error);
    }
}

debugHardGif();
