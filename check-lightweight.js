const axios = require('axios');

async function checkLightweightCandidates() {
    const candidates = [
        'https://hclips.com',
        'https://txxx.com',
        'https://tubepornclassic.com'
    ];

    console.log('Checking lightweight candidates (axios/cheerio compatible)...\n');

    for (const url of candidates) {
        try {
            const start = Date.now();
            const res = await axios.get(url, {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            console.log(`✅ ${url} - Status: ${res.status} (${Date.now() - start}ms)`);
            console.log(`   Length: ${res.data.length}`);

            // Check for video links
            if (res.data.includes('href="/video') || res.data.includes('href="/watch')) {
                console.log('   videos detected in HTML');
            } else {
                console.log('   no clear video links in root HTML');
            }

        } catch (e) {
            console.log(`❌ ${url} - ${e.message}`);
        }
    }
}

checkLightweightCandidates();
