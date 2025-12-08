const axios = require('axios');

async function checkRootURLs() {
    console.log('Checking ROOT URLs (no /trending)\n');

    console.log('1️⃣ Client API ROOT:');
    try {
        const working = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/');
        console.log('Type:', typeof working.data);
        console.log('Is Array?', Array.isArray(working.data));
        if (Array.isArray(working.data)) {
            console.log('Count:', working.data.length);
            console.log('First item:', JSON.stringify(working.data[0], null, 2));
        } else {
            console.log('Data:', working.data);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n---\n');

    console.log('2️⃣ Our API ROOT:');
    try {
        const ours = await axios.get('https://wenscrapper.onrender.com/');
        console.log('Type:', typeof ours.data);
        console.log('Content:', ours.data.substring(0, 200));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

checkRootURLs();
