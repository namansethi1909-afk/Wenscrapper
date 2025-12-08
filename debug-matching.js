const { HardGif } = require('./dist/scrapper/hardgif.scrapper');
const hardgif = new HardGif();

// Logic from server.ts
function getSimilarity(s1, s2) {
    const t1 = new Set(s1.toLowerCase().split(/[\s-]+/));
    const t2 = new Set(s2.toLowerCase().split(/[\s-]+/));
    const intersection = new Set([...t1].filter(x => t2.has(x)));
    const union = new Set([...t1, ...t2]);
    return intersection.size / union.size;
}

const targetTitle = "Desi Tamil Wife Blowjob and Fucking";
const keywords = "Desi Tamil Wife"; // Simulating what server might use

async function debug() {
    console.log(`Searching HardGif for: "${targetTitle}"`);

    // Server logic tries to search by title
    const searchResults = await hardgif.getSearch(targetTitle);
    console.log(`Found ${searchResults.length} results.`);

    for (const vid of searchResults) {
        const score = getSimilarity(targetTitle, vid.title);
        console.log(`- [Score: ${score.toFixed(2)}] ${vid.title}`);
        if (score > 0.3) {
            console.log("  MATCH CANDIDATE!");
        }
    }
}

debug();
