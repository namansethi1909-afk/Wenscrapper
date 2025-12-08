const axios = require('axios');

async function checkVideoFields() {
    console.log('Checking video fields from client API...\n');

    const response = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/');

    // This should be under data.data or just data
    let videos = response.data;
    if (response.data.data) videos = response.data.data;
    if (response.data.data && response.data.data.videos) videos = response.data.data.videos;

    console.log('Response type:', typeof videos);
    console.log('Is array?', Array.isArray(videos));

    if (Array.isArray(videos) && videos.length > 0) {
        console.log('\nFirst video - ALL FIELDS:');
        console.log(JSON.stringify(videos[0], null, 2));

        console.log('\nAll field names:', Object.keys(videos[0]));
    } else {
        console.log('\nFull response:');
        console.log(JSON.stringify(response.data, null, 2));
    }
}

checkVideoFields().catch(console.error);
