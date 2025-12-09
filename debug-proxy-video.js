const axios = require('axios');

async function debugProxy() {
    try {
        // 1. Get a fresh stream URL
        console.log('Fetching stream info...');
        // We know from search that ID is like /video-...
        // Let's get a fresh one to be sure
        const home = await axios.get('https://wenscrapper.onrender.com/');
        if (!home.data || !home.data[0]) throw new Error('Home failed');

        const id = home.data[0].id;
        const streamRes = await axios.get(`https://wenscrapper.onrender.com/streams?id=${encodeURIComponent(id)}`);

        const proxyUrl = streamRes.data.url;
        console.log('Proxy URL:', proxyUrl);

        if (!proxyUrl.includes('/proxy')) {
            console.log('❌ URL is not proxied!');
            return;
        }

        // 2. Fetch the PROXY URL
        console.log('Fetching Proxy stream...');
        const vid = await axios.get(proxyUrl, {
            responseType: 'stream',
            timeout: 15000,
            validateStatus: () => true // Accept all codes
        });

        console.log(`Status: ${vid.status}`);
        console.log('Headers:', vid.headers);

        // Check if we got data or error text
        if (vid.status >= 400) {
            let errorData = '';
            vid.data.on('data', c => errorData += c);
            vid.data.on('end', () => console.log('Error Body:', errorData));
        } else {
            console.log('✅ Proxy successfully returned stream!');
        }

    } catch (e) {
        console.error('Test Failed:', e.message);
    }
}
debugProxy();
