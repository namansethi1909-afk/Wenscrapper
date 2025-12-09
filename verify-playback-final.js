const axios = require('axios');

async function verifyPlayback() {
    try {
        console.log('Searching for video...');
        const searchRes = await axios.get('https://wenscrapper.onrender.com/search?q=teen', { timeout: 30000 });
        const videos = searchRes.data;

        if (videos.length > 0) {
            const first = videos[0];
            console.log(`Found: ${first.id} - ${first.title}`);
            console.log(`Poster: ${first.poster}`);

            console.log('Fetching stream...');
            const streamRes = await axios.get(`https://wenscrapper.onrender.com/streams?id=${first.id}`, { timeout: 30000 });
            console.log('Stream URL:', streamRes.data.url);

            if (streamRes.data.url && streamRes.data.url.includes('.mp4')) {
                console.log('✅ Stream extraction WORKS!');
            } else {
                console.log('❌ Stream extraction failed / returned generic.');
            }
        } else {
            console.log('❌ Search returned 0 videos');
        }
    } catch (e) {
        console.log('Error:', e.message);
        if (e.response) console.log(e.response.data);
    }
}
verifyPlayback();
