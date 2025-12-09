const axios = require('axios');

async function checkRedTube() {
    const url = 'http://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&search=teen&thumbsize=medium';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log(`Status: ${res.status}`);
        console.log('Data Type:', typeof res.data);
        // Sometimes it returns JSON in string
        if (JSON.stringify(res.data).includes('video')) {
            console.log('✅ Videos found in response');
        }
    } catch (e) {
        console.error('RedTube API failed:', e.message);
    }
}
checkRedTube();
