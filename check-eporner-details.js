const axios = require('axios');

async function checkEpornerDetails() {
    const id = 'MHbze3BI4q6';
    const url = `https://www.eporner.com/api/v2/video/id/?id=${id}`;
    try {
        console.log(`Fetching ${url}...`);
        const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 });
        console.log('Keys:', Object.keys(res.data));
        console.log('Embed:', res.data.embed);
        console.log('URL:', res.data.url);
    } catch (e) {
        console.error(e.message);
    }
}
checkEpornerDetails();
