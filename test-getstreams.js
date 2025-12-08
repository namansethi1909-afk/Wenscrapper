const axios = require('axios');

async function testGetStreams() {
    console.log('Testing masa49 getStreams...\n');

    // Get a video ID from root
    const videos = await axios.get('https://wenscrapper.onrender.com/');
    const testId = videos.data[0].id;

    console.log('Testing with ID:', testId);

    // Test streams endpoint
    try {
        const streams = await axios.get(`https://wenscrapper.onrender.com/streams?id=${testId}`);
        console.log('\nStreams response:');
        console.log(JSON.stringify(streams.data, null, 2));

        if (streams.data.url) {
            console.log('\n✅ Video URL found:', streams.data.url);
            console.log('Is MP4?', streams.data.url.includes('.mp4'));
        } else {
            console.log('\n❌ No video URL in streams response');
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

testGetStreams();
