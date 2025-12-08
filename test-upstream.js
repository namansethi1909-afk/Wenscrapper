const axios = require('axios');

async function testUpstream() {
    const videoUrl = 'https://server15.mmsbe1.xyz/uploads/myfiless/id/65517.mp4';

    console.log('Testing Upstream Direct Request...');
    try {
        const res = await axios({
            method: 'get',
            url: videoUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://www.fsiblog.cc/',
                'Range': 'bytes=0-100' // Request partial content
            },
            validateStatus: () => true
        });

        console.log(`Status: ${res.status}`);
        console.log(`Headers:`, res.headers);
    } catch (e) {
        console.error('Upstream Error:', e.message);
        if (e.response) console.log('Response:', e.response.status, e.response.data);
    }
}

testUpstream();
