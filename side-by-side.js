const axios = require('axios');

async function sideBySideComparison() {
    console.log('=== SIDE BY SIDE COMPARISON ===\n');

    const [ours, client] = await Promise.all([
        axios.get('https://wenscrapper.onrender.com/'),
        axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending')
    ]);

    console.log('OUR API (First Video):');
    console.log(JSON.stringify(ours.data[0], null, 2));

    console.log('\n---\n');

    console.log('CLIENT API (First Video):');
    console.log(JSON.stringify(client.data[0], null, 2));

    console.log('\n---\n');

    console.log('DIFFERENCES:');
    const ourKeys = Object.keys(ours.data[0] || {});
    const clientKeys = Object.keys(client.data[0]);

    console.log('Our fields:', ourKeys);
    console.log('Client fields:', clientKeys);

    console.log('\nExtra in ours:', ourKeys.filter(k => !clientKeys.includes(k)));
    console.log('Missing in ours:', clientKeys.filter(k => !ourKeys.includes(k)));

    // Check poster domain
    console.log('\n--- DOMAIN ANALYSIS ---');
    console.log('Our poster domain:', new URL(ours.data[0].poster).hostname);
    console.log('Client poster domain:', new URL(client.data[0].poster).hostname);
}

sideBySideComparison();
