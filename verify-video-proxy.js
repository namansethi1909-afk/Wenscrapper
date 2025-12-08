const axios = require('axios');

async function verifyVideoProxy() {
    console.log('🔍 Verifying Video Proxy Implementation\n');

    try {
        const response = await axios.get('https://wenscrapper.onrender.com/', { timeout: 60000 }); // Increase timeout

        if (Array.isArray(response.data)) {
            console.log('Response count:', response.data.length);

            if (response.data.length > 0) {
                const first = response.data[0];
                console.log('\nFirst video:');
                console.log(JSON.stringify(first, null, 2));

                if (first.url) {
                    console.log('\n✅ VIDEO URL FOUND!');
                    console.log('URL:', first.url);
                } else {
                    console.log('\n❌ URL IS EMPTY (Extraction failed)');
                }
            }
        } else {
            console.log('❌ Response matches unexpected format (not array):');
            console.log(typeof response.data);
            console.log(JSON.stringify(response.data).substring(0, 500));
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

verifyVideoProxy();
