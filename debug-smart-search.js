const { HardGif } = require('./dist/scrapper/hardgif.scrapper');
const hardgif = new HardGif();

const targetTitle = "Desi Tamil Wife Blowjob and Fucking";

async function debug() {
    // Strategy: First 3 words
    const simplified = targetTitle.split(' ').slice(0, 3).join(' ');
    console.log(`Searching HardGif for SIMPLIFIED query: "${simplified}"`);

    const searchResults = await hardgif.getSearch(simplified);
    console.log(`Found ${searchResults.length} results.`);

    // Check for fuzzy match against original title
    for (const vid of searchResults) {
        // Simple word overlap check
        console.log(`- Found: ${vid.title}`);
    }
}

debug();



