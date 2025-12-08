const axios = require('axios');

async function compareAPIs() {
    console.log('📊 Comparing API Formats\n');

    // Working API from client
    console.log('1️⃣ Client\'s Working API:');
    try {
        const working = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending', { timeout: 15000 });
        console.log('Status:', working.status);
        console.log('Response type:', Array.isArray(working.data) ? 'Array' : typeof working.data);
        console.log('Count:', working.data.length);
        console.log('\nFirst item:');
        console.log(JSON.stringify(working.data[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n---\n');

    // Our API
    console.log('2️⃣ Our API:');
    try {
        const ours = await axios.get('https://wenscrapper.onrender.com/trending', { timeout: 15000 });
        console.log('Status:', ours.status);
        console.log('Response type:', Array.isArray(ours.data) ? 'Array' : typeof ours.data);
        console.log('Count:', ours.data.length);
        console.log('\nFirst item:');
        console.log(JSON.stringify(ours.data[0], null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

compareAPIs();
