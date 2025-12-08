const axios = require('axios');

async function testRenderMasa49() {
    const base = 'https://wenscrapper.onrender.com';

    console.log('✅ SOLUTION FOUND!\n');
    console.log('The masa49 scraper IS deployed, but routes are different:\n');

    console.log('Testing Render endpoints...\n');

    try {
        // Test trending
        const trending = await axios.get(`${base}/trending`, { timeout: 15000 });
        console.log('✅ /trending works!');
        console.log(`   Found ${trending.data.length} videos\n`);

        // Test search
        const search = await axios.get(`${base}/search?q=desi`, { timeout: 15000 });
        console.log('✅ /search works!');
        console.log(`   Found ${search.data.length} results\n`);

        console.log('🎯 FOR SKYMUTE APP, USE THESE URLs:\n');
        console.log('Trending: https://wenscrapper.onrender.com/trending');
        console.log('Search:   https://wenscrapper.onrender.com/search?q=desi');
        console.log('\nNote: NO /masa49/ prefix needed!');

    } catch (error) {
        console.log('Error:', error.message);
    }
}

testRenderMasa49();
