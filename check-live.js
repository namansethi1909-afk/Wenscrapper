const https = require('https');

console.log('Checking live endpoint...');
https.get('https://wenscrapper.onrender.com/', (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Data length:', data.length);
        if (data.includes('Render')) console.log('⚠️  Returned Render default page');
        else console.log('Sample:', data.substring(0, 100));
    });
}).on('error', (e) => console.error(e));
