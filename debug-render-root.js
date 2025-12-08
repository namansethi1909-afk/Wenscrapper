const axios = require('axios');

async function debugRenderApp() {
    try {
        // Check what's actually deployed
        const root = await axios.get('https://wenscrapper.onrender.com/');
        console.log('Root response:', root.data);

    } catch (e) {
        console.log('Error:', e.message);
    }
}

debugRenderApp();
