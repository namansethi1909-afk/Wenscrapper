const axios = require('axios');

async function test() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    const id = 'desi-girl-shows-boobs-50'; // Slug ID

    try {
        console.log(`Testing ${baseUrl}/details?id=${id}...`);
        const details = await axios.get(`${baseUrl}/details?id=${id}`);
        console.log('Details success:', details.status);
        console.log('Title:', details.data.title);

        console.log(`Testing ${baseUrl}/streams?id=${id}...`);
        const streams = await axios.get(`${baseUrl}/streams?id=${id}`);
        console.log('Streams success:', streams.status);
        console.log('Stream URL:', streams.data.url);
    } catch (err) {
        console.error('Failed:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

test();
