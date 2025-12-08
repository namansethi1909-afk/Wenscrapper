const axios = require('axios');

async function debugThisVidLive() {
    try {
        console.log('Fetching Home...');
        const homeRes = await axios.get('https://wenscrapper.onrender.com/');
        const videos = homeRes.data;
        console.log('Videos found:', videos.length);

        if (videos.length > 0) {
            const first = videos[0];
            console.log('First Video:', first);

            console.log(`Fetching Stream for ID: ${first.id}...`);
            const streamRes = await axios.get(`https://wenscrapper.onrender.com/streams?id=${first.id}`);
            console.log('Stream Response:', streamRes.data);

            if (!streamRes.data.url) console.log('❌ Stream URL is missing!');
            else console.log('✅ Stream URL found:', streamRes.data.url);
        } else {
            console.log('❌ No videos returned from Home!');
        }

    } catch (e) {
        console.log('Error:', e.message);
        if (e.response) console.log('Res:', e.response.data);
    }
}
debugThisVidLive();
