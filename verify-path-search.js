const axios = require('axios');

async function verifyPathSearch() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    console.log('--- Verifying /search/:q ---');
    try {
        const res = await axios.get(`${baseUrl}/search/desi`);
        console.log('Status:', res.status);
        console.log('Is Array:', Array.isArray(res.data));
        console.log('Count:', res.data.length);
        if (res.data.length > 0) {
            console.log('First Title:', res.data[0].title);
            console.log('First Type:', res.data[0].type); // Check injection
        }
    } catch (e) { console.error('Path search failed', e.message); }
}

verifyPathSearch();
