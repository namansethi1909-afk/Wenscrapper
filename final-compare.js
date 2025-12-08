const axios = require('axios');

async function compareOurVsClient() {
    console.log('📊 Comparing Our API vs Client API\n');

    console.log('1️⃣ Our root (what Skymute sees):');
    const ours = await axios.get('https://wenscrapper.onrender.com/');
    console.log('Type:', Array.isArray(ours.data) ? 'Array' : typeof ours.data);
    if (Array.isArray(ours.data)) {
        console.log('First video:');
        console.log(JSON.stringify(ours.data[0], null, 2));
    }

    console.log('\n---\n');

    console.log('2️⃣ Client trending (where videos are):');
    const client = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending');
    console.log('First video:');
    console.log(JSON.stringify(client.data[0], null, 2));

    console.log('\n---\n');
    console.log('🔍 Analysis:');
    console.log('Our fields:', Object.keys(ours.data[0] || {}).join(', '));
    console.log('Client fields:', Object.keys(client.data[0]).join(', '));

    console.log('\n💡 Missing in ours:', Object.keys(client.data[0]).filter(k => !Object.keys(ours.data[0] || {}).includes(k)));
    console.log('💡 Extra in ours:', Object.keys(ours.data[0] || {}).filter(k => !Object.keys(client.data[0]).includes(k)));
}

compareOurVsClient();
