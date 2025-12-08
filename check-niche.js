const axios = require('axios');

async function checkCandidates() {
    const candidates = [
        'https://fsiblog.com',
        'https://fapello.com',
        'https://hclips.com',
        'https://txxx.com'
    ];

    console.log('Checking niche candidates...\n');

    for (const url of candidates) {
        try {
            const start = Date.now();
            const res = await axios.get(url, {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            console.log(`✅ ${url} - Status: ${res.status} (${Date.now() - start}ms)`);
            console.log(`   Length: ${res.data.length}`);
        } catch (e) {
            console.log(`❌ ${url} - ${e.message}`);
        }
    }
}

checkCandidates();
