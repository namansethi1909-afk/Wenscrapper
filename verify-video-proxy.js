const axios = require('axios');

async function verifyVideoProxy() {
    console.log('🔍 Verifying Video Proxy Implementation\n');

    try {
        const response = await axios.get('https://wenscrapper.onrender.com/', { timeout: 30000 });

        console.log('Response count:', response.data.length);

        if (response.data.length > 0) {
            const first = response.data[0];

            console.log('\nFirst video:');
            console.log(JSON.stringify(first, null, 2));

            console.log('\n📋 Field Check:');
            console.log('  - title:', first.title ? '✓' : '✗');
            console.log('  - id:', first.id ? '✓' : '✗');
            console.log('  - poster:', first.poster ? '✓' : '✗');
            console.log('  - url:', first.url ? '✓' : '✗');

            if (first.url) {
                console.log('\n✅ VIDEO URL FOUND!');
                console.log('URL:', first.url);
                console.log('Is MP4?', first.url.includes('.mp4') || first.url.includes('.m3u8'));

                // Test if URL is accessible
                try {
                    const head = await axios.head(first.url, { timeout: 5000 });
                    console.log('✅ Video URL is accessible (Status:', head.status, ')');
                } catch (e) {
                    console.log('⚠️ Could not verify video URL accessibility:', e.message);
                }
            } else {
                console.log('\n❌ NO VIDEO URL!');
            }

            console.log('\n🎯 READY FOR SKYMUTE TEST');
            console.log('Use: https://wenscrapper.onrender.com/');
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
        }
    }
}

verifyVideoProxy();
