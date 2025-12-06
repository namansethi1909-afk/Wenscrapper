const axios = require('axios');

async function probe(endpoint, params) {
    try {
        const url = `https://scrapper-fkbae.eastasia.cloudapp.azure.com${endpoint}`;
        console.log(`Probing ${url}...`);
        const res = await axios.get(url, { params, timeout: 5000 });
        console.log(`Success ${endpoint}:`, res.status);
        console.log('Data keys:', Object.keys(res.data));
    } catch (err) {
        console.log(`Failed ${endpoint}:`, err.message, err.response?.status);
    }
}

async function test() {
    await probe('/api/details', { id: '5084' });
    await probe('/api/streams', { id: '5084' });
    // Try with 'url' param if id doesn't work?
}

test();
