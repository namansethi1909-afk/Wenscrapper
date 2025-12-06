const axios = require('axios');

async function checkDeployment() {
    const url = 'https://wenscrapper.onrender.com';
    console.log(`Checking ${url}...`);

    try {
        // 1. Check Health
        const health = await axios.get(`${url}/health`);
        console.log('Health Status:', health.status, health.data);

        // 2. Check Search (FsiBlog)
        const search = await axios.get(`${url}/search/desi`);
        console.log('Search Status:', search.status);
        console.log('Search Results:', Array.isArray(search.data) ? search.data.length : 'Invalid');

    } catch (e) {
        console.error('Check Failed:', e.message);
        if (e.response) console.error('Response:', e.response.status, e.response.data);
    }
}

checkDeployment();
