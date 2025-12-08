const axios = require('axios');

async function dumpHClips() {
    try {
        const res = await axios.get('https://hclips.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log('HTML Dump (partial):');
        console.log(res.data.substring(0, 3000));

        // Try to find video block pattern
        const match = res.data.match(/class="[^"]*video[^"]*"/);
        if (match) console.log('Potential video class:', match[0]);
    } catch (e) { console.error(e); }
}
dumpHClips();
