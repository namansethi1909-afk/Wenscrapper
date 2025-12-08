const axios = require('axios');

async function verifySkymuteFix() {
    try {
        console.log('Testing fixed API format...\n');

        const response = await axios.get('https://wenscrapper.onrender.com/trending');

        if (response.data.length > 0) {
            const first = response.data[0];

            console.log('✅ API Response Structure:');
            console.log('  - id:', first.id ? '✓' : '✗');
            console.log('  - title:', first.title ? '✓' : '✗');
            console.log('  - poster:', first.poster ? '✓' : '✗');
            console.log('  - url:', first.url ? '✓' : '✗', first.url ? `(${first.url.substring(0, 40)}...)` : '');
            console.log('  - thumbnail:', first.thumbnail ? '✓' : '✗');
            console.log('  - type:', first.type ? '✓' : '✗', `(${first.type})`);

            console.log('\n📌 Skymute should now work with:');
            console.log('https://wenscrapper.onrender.com/trending\n');
        }

    } catch (error) {
        console.log('Error:', error.message);
    }
}

verifySkymuteFix();
