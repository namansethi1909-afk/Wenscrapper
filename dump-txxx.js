const axios = require('axios');

async function dumpTxxx() {
    try {
        const res = await axios.get('https://txxx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log('Txxx Dump (partial):');
        console.log(res.data.substring(0, 3000));

        // Find video block pattern
        const match = res.data.match(/class="[^"]*video[^"]*"/);
        if (match) console.log('Potential video class:', match[0]);
    } catch (e) { console.error(e); }
}
dumpTxxx();
