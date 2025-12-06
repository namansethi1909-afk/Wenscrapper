const axios = require('axios');

async function verifyLive() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    const id = 'desi-girl-shows-boobs-50';

    console.log('--- Verifying Live /details (Promise Bug) ---');
    try {
        const res = await axios.post(`${baseUrl}/fsiblog/details`, { id });
        const suggestions = res.data.suggestedVideo;

        console.log('Suggested Video Type:', Array.isArray(suggestions) ? 'Array' : typeof suggestions);
        if (Array.isArray(suggestions) && suggestions.length > 0) {
            console.log('✅ Suggestions populated: Promise bug IS FIXED.');
        } else if (suggestions && typeof suggestions.then === 'function') {
            console.log('❌ Suggestions is a Promise: Bug NOT fixed.');
        } else {
            console.log('⚠️ Suggestions is empty or object:', JSON.stringify(suggestions));
        }
    } catch (e) { console.error('Details check failed', e.message); }

    console.log('\n--- Verifying Live /fsiblog/search ---');
    try {
        // App uses GET
        const res = await axios.get(`${baseUrl}/fsiblog/search?q=desi`);
        console.log('Search Status:', res.status);
        console.log('Is Array:', Array.isArray(res.data));
        console.log('Count:', res.data.length);
        if (res.data.length > 0) {
            console.log('First Item Keys:', Object.keys(res.data[0]));
        }
    } catch (e) { console.error('Search check failed', e.message); }
}

verifyLive();
