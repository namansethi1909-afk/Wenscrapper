const axios = require('axios');

async function checkEpornerAPI() {
    const url = 'https://www.eporner.com/api/v2/web/search/?query=test&page=1';
    try {
        console.log(`Checking ${url}...`);
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log(`Status: ${res.status}`);
        console.log('Data Type:', typeof res.data);
        if (res.data.videos) {
            console.log('Videos found:', res.data.videos.length);
            console.log('Sample:', res.data.videos[0]);
        }
    } catch (e) { console.error('Eporner API failed:', e.message); }
}
checkEpornerAPI();
