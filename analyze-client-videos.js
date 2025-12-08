const axios = require('axios');

async function analyzeClientURLs() {
    const response = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending');

    console.log('Analyzing client API video structure:\n');

    const videos = response.data.slice(0, 5);

    videos.forEach((v, i) => {
        console.log(`Video ${i + 1}:`);
        console.log('  id:', v.id);
        console.log('  title:', v.title);
        console.log('  poster:', v.poster);

        // Check if poster URL has video URL pattern
        const posterUrl = v.poster || '';
        if (posterUrl.includes('.mp4')) {
            console.log('  ⚠️ Poster contains .mp4!');
        }
        if (posterUrl.replace('.jpg', '.mp4').includes('.mp4')) {
            console.log('  💡 Poster might convert to video:', posterUrl.replace('.jpg', '.mp4'));
        }

        console.log('');
    });

    // Check if they have /video or /stream endpoint with id
    console.log('\nTrying possible video endpoints:');
    const testId = videos[0].id;

    const endpoints = [
        `/video?id=${testId}`,
        `/stream?id=${testId}`,
        `/play?id=${testId}`,
        `/watch?id=${testId}`,
        `/${testId}.mp4`,
        `/${testId}/video`
    ];

    for (const endpoint of endpoints) {
        try {
            const test = await axios.head(`https://scrapper-fkbae.eastasia.cloudapp.azure.com${endpoint}`, { timeout: 3000 });
            console.log(`✅ ${endpoint} - Status:`, test.status);
        } catch (e) {
            console.log(`❌ ${endpoint} - ${e.response?.status || 'Failed'}`);
        }
    }
}

analyzeClientURLs();
