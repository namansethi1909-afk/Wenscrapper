const { HardGif } = require('./src/scrapper/hardgif.scrapper');

// Simple Jaccard Index for token overlap
function similarity(s1, s2) {
    const t1 = new Set(s1.toLowerCase().split(/[\s-]+/));
    const t2 = new Set(s2.toLowerCase().split(/[\s-]+/));
    const intersection = new Set([...t1].filter(x => t2.has(x)));
    const union = new Set([...t1, ...t2]);
    return intersection.size / union.size;
}

async function testFuzzy() {
    const scraper = new HardGif();
    const target = "Desi Tamil Wife Blowjob and Fucking";
    console.log(`Target: "${target}"`);

    // Broad searches
    const keywords = ["Tamil", "Desi", "Wife"];
    let candidates = [];

    for (const k of keywords) {
        console.log(`Searching: ${k}`);
        try {
            const res = await scraper.getSearch(k);
            candidates = [...candidates, ...res];
        } catch (e) { }
    }

    // Deduplicate
    const unique = new Map();
    candidates.forEach(c => unique.set(c.id, c));

    // Rank
    const ranked = Array.from(unique.values()).map(c => ({
        ...c,
        score: similarity(target, c.title)
    })).sort((a, b) => b.score - a.score);

    console.log('\n--- Top Matches ---');
    ranked.slice(0, 5).forEach(m => {
        console.log(`[${m.score.toFixed(2)}] ${m.title} (ID: ${m.id})`);
    });
}

testFuzzy();
