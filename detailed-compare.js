const axios = require('axios');
const fs = require('fs');

async function detailedCompare() {
    console.log('Fetching both APIs...\n');

    const working = await axios.get('https://scrapper-fkbae.eastasia.cloudapp.azure.com/trending');
    const ours = await axios.get('https://wenscrapper.onrender.com/trending');

    const workingItem = working.data[0];
    const ourItem = ours.data[0];

    console.log('WORKING API (Client):');
    console.log(JSON.stringify(workingItem, null, 2));

    console.log('\n\n================\n\n');

    console.log('OUR API:');
    console.log(JSON.stringify(ourItem, null, 2));

    console.log('\n\n================\n\n');

    console.log('FIELD COMPARISON:');
    const workingKeys = Object.keys(workingItem);
    const ourKeys = Object.keys(ourItem);

    console.log('\nWorking API fields:', workingKeys.join(', '));
    console.log('Our API fields:', ourKeys.join(', '));

    console.log('\nMissing in ours:', workingKeys.filter(k => !ourKeys.includes(k)));
    console.log('Extra in ours:', ourKeys.filter(k => !workingKeys.includes(k)));

    // Save to file for review
    fs.writeFileSync('api-comparison.json', JSON.stringify({ working: workingItem, ours: ourItem }, null, 2));
    console.log('\n✅ Saved to api-comparison.json');
}

detailedCompare().catch(console.error);
