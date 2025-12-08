const axios = require('axios');

async function getRawClientResponse() {
    const response = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending');

    console.log('RAW RESPONSE (first video):\n');
    console.log(JSON.stringify(response.data[0], null, 2));

    console.log('\n\nALL FIELDS:');
    console.log(Object.keys(response.data[0]));

    console.log('\n\nField count:', Object.keys(response.data[0]).length);
}

getRawClientResponse();
