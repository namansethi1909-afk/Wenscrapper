const axios = require('axios');

async function verifyEpornerLive() {
    const url = 'https://wenscrapper.onrender.com/';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, { timeout: 60000 });
        console.log(`Status: ${res.status}`);
        const data = res.data;

        if (Array.isArray(data)) {
            console.log(`✅ Success! Received array of ${data.length} videos.`);
            if (data.length > 0) {
                console.log('Sample:', data[0]);
                // Check format
                if (data[0].id && data[0].title && data[0].poster) {
                    console.log('✅ Format looks correct.');
                } else {
                    console.log('⚠️ Unexpected format (missing keys).');
                }

                // Verify stream extraction for first item
                const id = data[0].id;
                console.log(`Testing stream extraction for ID: ${id}`);
                const sUrl = `https://wenscrapper.onrender.com/streams?id=${id}`;
                const streamRes = await axios.get(sUrl);
                console.log('Stream Response:', streamRes.data);

                if (streamRes.data.url && streamRes.data.url.includes('.mp4')) {
                    console.log('✅ Stream extraction SUCCESS: Found .mp4 link');
                } else {
                    console.log('❌ Stream extraction FAILED (No .mp4)');
                }
            }
        } else {
            console.log('❌ Received non-array response:', typeof data);
            console.log('Preview:', JSON.stringify(data).slice(0, 100));
        }

    } catch (e) {
        if (e.response) {
            console.log(`❌ Error ${e.response.status}: ${e.response.statusText}`);
        } else {
            console.log('❌ Connection error:', e.message);
        }
    }
}
verifyEpornerLive();
