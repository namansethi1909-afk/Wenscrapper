const axios = require('axios');

async function checkBoth() {
    console.log('📊 Checking Current Status\n');

    // Our API
    console.log('1️⃣ OUR API (Render):');
    try {
        const ours = await axios.get('https://wenscrapper.onrender.com/trending');
        console.log('First item:', JSON.stringify(ours.data[0], null, 2));
        console.log('Field count:', Object.keys(ours.data[0]).length);
        console.log('Fields:', Object.keys(ours.data[0]).join(', '));
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n---\n');

    // Working API
    console.log('2️⃣ WORKING API (Azure):');
    try {
        const working = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending');
        console.log('First item:', JSON.stringify(working.data[0], null, 2));
        console.log('Field count:', Object.keys(working.data[0]).length);
        console.log('Fields:', Object.keys(working.data[0]).join(', '));
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n---\n');
    console.log('✅ If field counts match (3), Render deployed correctly');
    console.log('❌ If field counts differ, Render hasn\'t deployed yet');
}

checkBoth();
