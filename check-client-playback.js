const axios = require('axios');

async function checkClientEndpoints() {
    console.log('Checking client API endpoints...\n');

    // Get root to see endpoints
    const root = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/');
    console.log('Root response:');
    console.log(JSON.stringify(root.data, null, 2));

    console.log('\n---\n');

    // Test details endpoint
    console.log('Testing /details with id=5084:');
    try {
        const details = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/details?id=5084');
        console.log('Details response:');
        console.log(JSON.stringify(details.data, null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n---\n');

    // Test streams endpoint  
    console.log('Testing /streams with id=5084:');
    try {
        const streams = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/streams?id=5084');
        console.log('Streams response:');
        console.log(JSON.stringify(streams.data, null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

checkClientEndpoints().catch(console.error);
