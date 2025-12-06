const axios = require('axios');

async function testId() {
    // 65519 is from the poster url in previous logs
    const url = 'https://www.fsiblog.cc/?p=65519';
    console.log(`Checking ${url}...`);
    try {
        const res = await axios.get(url, { maxRedirects: 0, validateStatus: null });
        console.log('Status:', res.status);
        console.log('Location:', res.headers.location);
    } catch (e) { console.error(e.message); }
}

testId();
