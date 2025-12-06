const axios = require('axios');

async function testVideo() {
    const videoUrl = 'https://server15.mmsbee1.xyz/uploads/myfiless/id/65519.mp4';
    console.log('--- Testing Video Access ---');

    // Test 1: No Headers
    try {
        await axios.head(videoUrl, { timeout: 5000 });
        console.log('✅ Video accessible WITHOUT headers');
    } catch (e) {
        console.log('❌ Video failed WITHOUT headers:', e.message, e.response?.status);
    }

    // Test 2: With Referer
    try {
        await axios.head(videoUrl, {
            headers: { 'Referer': 'https://www.fsiblog.cc/' },
            timeout: 5000
        });
        console.log('✅ Video accessible WITH Referer');
    } catch (e) {
        console.log('❌ Video failed WITH Referer:', e.message);
    }
}

async function testSearch() {
    console.log('\n--- Testing Search Endpoint ---');
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    try {
        const res = await axios.get(`${baseUrl}/fsiblog/search?q=desi&page=1`, { timeout: 10000 });
        console.log('Search Status:', res.status);
        console.log('Items found:', res.data.length);
        console.log('First item:', res.data[0]);
    } catch (e) {
        console.log('❌ Search failed:', e.message);
    }
}

async function run() {
    await testVideo();
    await testSearch();
}

run();
