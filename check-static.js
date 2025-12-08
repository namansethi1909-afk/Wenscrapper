const axios = require('axios');

async function checkStatic() {
    const candidates = [
        'https://daftsex.com',
        'https://www.porntrex.com',
        'https://hqporner.com',
        'https://tnaflix.com'
    ];

    console.log('Checking static candidates...\n');

    for (const url of candidates) {
        try {
            const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
            console.log(`✅ ${url} - Status: ${res.status}`);

            if (res.data.match(/href="\/[a-z]+\/[^"]+"/)) {
                console.log('   Found potential video links!');
            } else {
                console.log('   No obvious video links.');
            }
        } catch (e) {
            console.log(`❌ ${url} - ${e.message}`);
        }
    }
}
checkStatic();
