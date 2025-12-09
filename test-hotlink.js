const axios = require('axios');
const fs = require('fs');

async function testHotlink() {
    // 1. Get a fresh link from our API
    try {
        console.log('Getting fresh video link...');
        const searchRes = await axios.get('https://wenscrapper.onrender.com/');
        const videoId = searchRes.data[0].id; // /video-...

        const streamRes = await axios.get(`https://wenscrapper.onrender.com/streams?id=${encodeURIComponent(videoId)}`);
        const mp4Url = streamRes.data.url;

        console.log('MP4 URL:', mp4Url);

        if (!mp4Url) {
            console.log('No URL returned to test.');
            return;
        }

        // 2. Try to fetch it WITHOUT headers (simulate Skymute)
        console.log('Attempting fetch without Referer...');
        try {
            const vid = await axios.get(mp4Url, {
                responseType: 'stream',
                timeout: 10000
            });
            console.log(`✅ Success! Status: ${vid.status}`);
            console.log('Content-Type:', vid.headers['content-type']);
        } catch (e) {
            console.log(`❌ Direct Fetch Failed: ${e.message}`);
            if (e.response) console.log(`Status: ${e.response.status}`);
        }

    } catch (e) {
        console.log('Setup failed:', e.message);
    }
}
testHotlink();
