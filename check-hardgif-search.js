const axios = require('axios');

async function checkHardGifSearch() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    console.log('--- Verifying HardGif Search /search/desi ---');
    try {
        const res = await axios.get(`${baseUrl}/search/desi`);
        console.log('Status:', res.status);
        console.log('Is Array:', Array.isArray(res.data));
        console.log('Count:', res.data.length);
        if (res.data.length > 0) {
            console.log('First Title:', res.data[0].title);
            console.log('First ID:', res.data[0].id); // check if numeric
        } else {
            console.log('⚠️ Search returned EMPTY array (Cause of "Spelling Error")');
        }
    } catch (e) { console.error('Search check failed', e.message); }
}

checkHardGifSearch();
