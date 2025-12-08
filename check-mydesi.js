const axios = require('axios');

async function checkMyDesi() {
    console.log('Checking MyDesi.click accessibility...\n');
    try {
        const response = await axios.get('https://mydesi.click/', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        console.log('Status:', response.status);
        console.log('Data length:', response.data.length);
        console.log('Sample content:', response.data.substring(0, 200));
    } catch (e) {
        console.log('Error:', e.message);
    }
}

checkMyDesi();
