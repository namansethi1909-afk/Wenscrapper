const axios = require('axios');

async function checkMasa49Render() {
    try {
        console.log('Testing https://wenscrapper.onrender.com/masa49/trending\n');
        const response = await axios.get('https://wenscrapper.onrender.com/masa49/trending', { timeout: 15000 });

        console.log('✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Videos found:', response.data.length);

        if (response.data.length > 0) {
            console.log('\nFirst video:');
            console.log('- Title:', response.data[0].title);
            console.log('- ID:', response.data[0].id);
            console.log('- Poster:', response.data[0].poster);
        }

        console.log('\n✅ PASTE THIS URL IN SKYMUTE:');
        console.log('https://wenscrapper.onrender.com/masa49/trending');

    } catch (error) {
        console.log('❌ Failed:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
        }
    }
}

checkMasa49Render();
