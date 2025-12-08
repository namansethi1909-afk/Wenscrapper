const axios = require('axios');

async function checkRenderStatus() {
    const baseUrl = 'https://wenscrapper.onrender.com';

    console.log('🔍 Checking Render deployment status...\n');

    // Test 1: Root endpoint
    try {
        const root = await axios.get(`${baseUrl}/`, { timeout: 10000 });
        console.log('✅ Root (/) endpoint:', root.status);
        console.log('   Response:', JSON.stringify(root.data).substring(0, 200));
    } catch (e) {
        console.log('❌ Root (/) endpoint failed:', e.message);
    }

    console.log('');

    // Test 2: Check if old endpoints work
    try {
        const trending = await axios.get(`${baseUrl}/trending`, { timeout: 10000 });
        console.log('✅ Old /trending endpoint:', trending.status);
    } catch (e) {
        console.log('❌ Old /trending endpoint:', e.message);
    }

    console.log('');

    // Test 3: Check masa49 trending
    try {
        const masa = await axios.get(`${baseUrl}/masa49/trending`, { timeout: 15000 });
        console.log('✅ Masa49 /masa49/trending:', masa.status);
        console.log('   Videos found:', masa.data.length);
    } catch (e) {
        console.log('❌ Masa49 /masa49/trending:', e.message);
        if (e.response) {
            console.log('   Status:', e.response.status);
        }
    }
}

checkRenderStatus();
