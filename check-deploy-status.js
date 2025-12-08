const https = require('https');

const url = 'https://wenscrapper.onrender.com/health';
const maxRetries = 20;
let retries = 0;

function check() {
    retries++;
    console.log(`[Attempt ${retries}/${maxRetries}] Checking ${url}...`);
    const req = https.get(url, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('Body:', data);
                console.log('Deployment SUCCESS!');
                process.exit(0);
            } else {
                console.log(`Response: ${data.slice(0, 100)}...`);
            }
        });
    });

    req.on('error', (e) => {
        console.log(`Error: ${e.message}`);
    });

    req.on('timeout', () => {
        console.log('Timeout abating request...');
        req.destroy();
    });

    if (retries >= maxRetries) {
        console.log('Max retries reached. Deployment verifying failed.');
        process.exit(1);
    }
}

// Check immediately then every 30s
check();
setInterval(check, 30000);
