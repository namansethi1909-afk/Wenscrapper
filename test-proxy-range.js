const axios = require('axios');

async function testRange() {
    const videoUrl = 'https://server15.mmsbee1.xyz/uploads/myfiless/id/65517.mp4'; // FRESH URL
    const proxyUrl = 'http://localhost:3001/api/proxy';

    console.log('Testing Proxy Range Support...');

    try {
        const res = await axios.get(proxyUrl, {
            params: { url: videoUrl },
            headers: { 'Range': 'bytes=0-100' }, // Request first 100 bytes
            validateStatus: () => true // Don't throw on non-200
        });

        console.log(`Status: ${res.status}`); // Should be 206
        console.log(`Content-Range: ${res.headers['content-range']}`);
        console.log(`Content-Length: ${res.headers['content-length']}`);

        if (res.status === 206) {
            console.log('SUCCESS: Proxy supports Range requests.');
        } else {
            console.log('FAILURE: Proxy returned ' + res.status + ' (Expected 206)');
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

testRange();
