const axios = require('axios');

async function checkStreams() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    const id = 'desi-girl-shows-boobs-50';

    console.log('--- Verifying Live /streams ---');
    try {
        const res = await axios.post(`${baseUrl}/fsiblog/streams`, { id });
        console.log('Status:', res.status);
        console.log('Is Array:', Array.isArray(res.data));
        if (Array.isArray(res.data) && res.data.length > 0) {
            console.log('Stream URL:', res.data[0].url);
            console.log('Stream Keys:', Object.keys(res.data[0]));
        } else {
            console.log('❌ Invalid Streams Response:', JSON.stringify(res.data));
        }
    } catch (e) { console.error('Streams check failed', e.message); }
}

checkStreams();


