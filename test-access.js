const axios = require('axios');

async function testAccess() {
    const url = 'https://server15.mmsbee1.xyz/uploads/myfiless/id/65517.mp4';

    console.log('--- Testing Access WITHOUT Headers ---');
    try {
        const res = await axios.head(url);
        console.log('Status:', res.status); // 200 means headers NOT needed
    } catch (e) {
        console.log('Failed:', e.response ? e.response.status : e.message); // 403 means headers needed
    }

    console.log('\n--- Testing Access WITH Headers ---');
    try {
        const res = await axios.head(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 ...',
                'Referer': 'https://www.fsiblog.cc/'
            }
        });
        console.log('Status:', res.status);
    } catch (e) {
        console.log('Failed:', e.response ? e.response.status : e.message);
    }
}

testAccess();
