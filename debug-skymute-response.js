const axios = require('axios');

async function debugSkymute() {
    try {
        const response = await axios.get('https://wenscrapper.onrender.com/trending');

        console.log('Full first item:');
        console.log(JSON.stringify(response.data[0], null, 2));

        console.log('\n---');
        console.log('URL field value:', response.data[0].url);
        console.log('Is it a video file?', response.data[0].url?.includes('.mp4') || response.data[0].url?.includes('.m3u8'));

    } catch (error) {
        console.log('Error:', error.message);
    }
}

debugSkymute();
