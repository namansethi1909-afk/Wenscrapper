const axios = require('axios');

async function checkBeeg() {
    try {
        console.log('Checking Beeg API...');
        // Standard Beeg API for tags or index
        // Try getting latest
        const res = await axios.get('https://api.beeg.com/api/v6/video/view?date=2024-12-08', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        // Actually Beeg API endpoint might have changed.
        // Let's try main site and look for XHR/Fetch/NextJS props

    } catch (e) { console.log('Beeg direct API failed:', e.message); }

    // Try main site
    try {
        const res = await axios.get('https://beeg.com', { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        console.log('Beeg Home Status:', res.status);
        if (res.data.includes('api.beeg.com')) console.log('Beeg API ref found');
    } catch (e) {
        console.log('Beeg Home failed:', e.message);
    }
}
checkBeeg();
