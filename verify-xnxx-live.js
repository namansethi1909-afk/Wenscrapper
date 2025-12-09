const axios = require('axios');

async function verifyXnxxLive() {
    const baseUrl = 'https://wenscrapper.onrender.com';
    try {
        console.log('Fetching Home (XNXX)...');
        const res = await axios.get(baseUrl + '/', { timeout: 30000 });
        const videos = res.data;

        if (Array.isArray(videos) && videos.length > 0) {
            console.log(`✅ Home returned ${videos.length} videos.`);
            console.log('Sample:', videos[0]);

            const firstId = videos[0].id; // this should be full path e.g. /video-123/title
            console.log(`Testing Stream for ID: ${firstId}`);

            // Note: server expects ?id=...
            const streamRes = await axios.get(`${baseUrl}/streams?id=${encodeURIComponent(firstId)}`, { timeout: 30000 });
            console.log('Stream Response:', streamRes.data);

            if (streamRes.data.url && streamRes.data.url.includes('.mp4')) {
                console.log('✅ SUCCESS: Found direct MP4 URL!');
            } else {
                console.log('❌ FAILED: No MP4 found.');
            }

        } else {
            console.log('❌ Home returned empty or invalid data.');
            console.log('Data:', videos);
        }

    } catch (e) {
        console.log('❌ Error:', e.message);
        if (e.response) console.log('Status:', e.response.status);
    }
}
verifyXnxxLive();
