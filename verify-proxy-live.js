const axios = require('axios');

async function verifyProxyLive() {
    const baseUrl = 'https://wenscrapper.onrender.com';
    try {
        console.log('Fetching Home...');
        const res = await axios.get(baseUrl + '/', { timeout: 30000 });
        const videos = res.data;

        if (videos.length > 0) {
            const firstId = videos[0].id;
            console.log(`Getting Stream for ${firstId}...`);

            const streamRes = await axios.get(`${baseUrl}/streams?id=${encodeURIComponent(firstId)}`, { timeout: 30000 });
            const streamData = streamRes.data;
            console.log('Stream Data:', streamData);

            if (streamData.url && streamData.url.includes('/proxy?url=')) {
                console.log('✅ URL is proxied properly.');

                // Test the proxy link
                console.log('Testing Proxy Stream...');
                try {
                    const vidRes = await axios.get(streamData.url, {
                        responseType: 'stream',
                        timeout: 10000
                    });
                    console.log(`✅ PROXY SUCCESS! Code: ${vidRes.status}`);
                    console.log('Headers:', vidRes.headers['content-type']);
                } catch (e) {
                    console.log(`❌ Proxy Fetch Failed: ${e.message}`);
                    if (e.response) console.log(e.response.status);
                }

            } else {
                console.log('❌ URL is NOT proxied (Deploy pending or logic fail).');
            }

        } else {
            console.log('Home empty.');
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}
verifyProxyLive();
