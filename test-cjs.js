const cheerio = require('cheerio');
const axios = require('axios');

async function test() {
    try {
        console.log('Cheerio:', typeof cheerio.load);
        const res = await axios.get('https://example.com');
        console.log('Axios:', res.status);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
