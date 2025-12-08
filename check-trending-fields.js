const axios = require('axios');

async function checkClientTrending() {
    const response = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending');

    console.log('Count:', response.data.length);
    console.log('\nFirst video - ALL FIELDS:');
    console.log(JSON.stringify(response.data[0], null, 2));

    console.log('\nField names:', Object.keys(response.data[0]));
}

checkClientTrending();
