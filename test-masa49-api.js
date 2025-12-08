const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testMasa49API() {
    console.log('Testing Masa49 API endpoints...\n');

    // Test 1: Get Home/Trending
    console.log('1. Testing GET /masa49/trending');
    try {
        const response = await axios.get(`${BASE_URL}/masa49/trending`);
        console.log(`   ✓ Status: ${response.status}`);
        console.log(`   ✓ Found ${response.data.length} videos`);
        if (response.data.length > 0) {
            console.log(`   ✓ First video: ${response.data[0].title}`);
            console.log(`   ✓ Video ID: ${response.data[0].id}`);
        }
        console.log('');
    } catch (error) {
        console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 2: Search
    console.log('2. Testing GET /masa49/search/desi');
    try {
        const response = await axios.get(`${BASE_URL}/masa49/search/desi`);
        console.log(`   ✓ Status: ${response.status}`);
        console.log(`   ✓ Found ${response.data.length} results`);
        if (response.data.length > 0) {
            console.log(`   ✓ First result: ${response.data[0].title}`);
        }
        console.log('');
    } catch (error) {
        console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 3: Get Details
    console.log('3. Testing POST /masa49/details');
    try {
        const response = await axios.post(`${BASE_URL}/masa49/details`, {
            id: 'desi-old-body-massage-and-fucked-cute-girl-part-2'
        });
        console.log(`   ✓ Status: ${response.status}`);
        console.log(`   ✓ Title: ${response.data.title}`);
        console.log(`   ✓ Suggested videos: ${response.data.suggestedVideo?.length || 0}`);
        console.log('');
    } catch (error) {
        console.log(`   ✗ Error: ${error.message}\n`);
    }

    // Test 4: Get Streams
    console.log('4. Testing POST /masa49/streams');
    try {
        const response = await axios.post(`${BASE_URL}/masa49/streams`, {
            id: 'desi-old-body-massage-and-fucked-cute-girl-part-2'
        });
        console.log(`   ✓ Status: ${response.status}`);
        console.log(`   ✓ Stream URL: ${response.data[0].url}`);
        console.log(`   ✓ Quality: ${response.data[0].quality}`);
        console.log('');
    } catch (error) {
        console.log(`   ✗ Error: ${error.message}\n`);
    }

    console.log('All tests completed!');
}

testMasa49API().catch(console.error);
