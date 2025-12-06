const axios = require('axios');

async function checkHeaders() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    const id = 'desi-girl';

    console.log('--- Verifying Legacy Headers ---');
    try {
        const res = await axios.post(`${baseUrl}/streams`, { id });
        if (Array.isArray(res.data) && res.data.length > 0) {
            const stream = res.data[0];
            console.log('Keys:', Object.keys(stream));
            console.log('Has userAgent:', !!stream.userAgent);
            console.log('Has referer:', !!stream.referer);
            console.log('Type:', stream.type); // Check type injection too
        }
    } catch (e) { console.error('Header check failed', e.message); }
}

checkHeaders();
