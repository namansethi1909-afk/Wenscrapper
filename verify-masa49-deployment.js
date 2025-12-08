const axios = require('axios');

async function checkMasa49Deployment() {
    const baseUrl = 'https://wenscrapper.onrender.com';
    console.log(`\n🚀 Checking Masa49 API on ${baseUrl}...\n`);

    try {
        // Test 1: Trending
        console.log('1️⃣  Testing /masa49/trending');
        const trending = await axios.get(`${baseUrl}/masa49/trending`, { timeout: 15000 });
        console.log(`   ✅ Status: ${trending.status}`);
        console.log(`   📊 Found ${trending.data.length} videos\n`);

        // Test 2: Search
        console.log('2️⃣  Testing /masa49/search/desi');
        const search = await axios.get(`${baseUrl}/masa49/search/desi`, { timeout: 15000 });
        console.log(`   ✅ Status: ${search.status}`);
        console.log(`   🔍 Found ${search.data.length} results\n`);

        // Test 3: Details
        if (trending.data.length > 0) {
            const videoId = trending.data[0].id;
            console.log(`3️⃣  Testing /masa49/details (ID: ${videoId})`);
            const details = await axios.post(`${baseUrl}/masa49/details`, { id: videoId }, { timeout: 15000 });
            console.log(`   ✅ Status: ${details.status}`);
            console.log(`   📝 Title: ${details.data.title}\n`);

            // Test 4: Streams
            console.log(`4️⃣  Testing /masa49/streams (ID: ${videoId})`);
            const streams = await axios.post(`${baseUrl}/masa49/streams`, { id: videoId }, { timeout: 15000 });
            console.log(`   ✅ Status: ${streams.status}`);
            console.log(`   🎬 Stream URL: ${streams.data[0].url.substring(0, 50)}...\n`);
        }

        console.log('✅ All Masa49 endpoints are working on Render!\n');
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (error.response) {
            console.error(`   Response: ${error.response.status} - ${JSON.stringify(error.response.data).substring(0, 100)}`);
        }
        console.log('\n⏳ If deployment just happened, wait 1-2 minutes and try again.\n');
    }
}

checkMasa49Deployment();
