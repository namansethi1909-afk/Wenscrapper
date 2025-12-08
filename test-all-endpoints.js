const axios = require('axios');

async function testAllEndpoints() {
    const base = 'https://wenscrapper.onrender.com';

    console.log('🔍 Testing all Render endpoints...\n');

    // Test old endpoints
    const tests = [
        { name: 'Root', url: `${base}/` },
        { name: 'Trending (old)', url: `${base}/trending` },
        { name: 'Search (old)', url: `${base}/search/desi` },
        { name: 'Masa49 Trending', url: `${base}/masa49/trending` },
    ];

    for (const test of tests) {
        try {
            const res = await axios.get(test.url, { timeout: 10000 });
            console.log(`✅ ${test.name}: ${res.status}`);
        } catch (e) {
            console.log(`❌ ${test.name}: ${e.response?.status || e.message}`);
        }
    }

    console.log('\n📌 CONCLUSION:');
    console.log('If masa49 endpoints fail, use local URL in Skymute:');
    console.log('http://10.157.23.87:3000/masa49/trending\n');
}

testAllEndpoints();
