const axios = require('axios');

async function checkResponseFormat() {
    try {
        const response = await axios.get('https://wenscrapper.onrender.com/trending');

        console.log('Response structure:');
        console.log('Type:', Array.isArray(response.data) ? 'Array' : typeof response.data);
        console.log('Count:', response.data.length);

        if (response.data.length > 0) {
            console.log('\nFirst item structure:');
            console.log(JSON.stringify(response.data[0], null, 2));
        }

    } catch (error) {
        console.log('Error:', error.message);
    }
}

checkResponseFormat();
