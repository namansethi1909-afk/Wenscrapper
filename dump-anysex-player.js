const axios = require('axios');

async function dumpAnySexPlayer() {
    try {
        // Fetch home to get a video link
        const homeRes = await axios.get('https://anysex.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const videoMatch = homeRes.data.match(/href="(\/videos\/[0-9]+\/[^"]+)"/);

        if (videoMatch) {
            const videoUrl = 'https://anysex.com' + videoMatch[1];
            console.log('Fetching:', videoUrl);
            const res = await axios.get(videoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });

            console.log('--- Player HTML Snippet ---');
            const html = res.data;
            // Look for dangerous scripts or config
            const scriptMatch = html.match(/<script>[^<]*video_url[^<]*<\/script>/);
            if (scriptMatch) console.log(scriptMatch[0]);

            // Look for sources
            const sources = html.match(/<source[^>]+>/g);
            if (sources) console.log(sources);

            // Look for MP4 strings
            const mp4s = html.match(/https?:\/\/[^"']+\.mp4/g);
            console.log('MP4s found:', mp4s);
        } else {
            console.log('No video link found on home');
        }
    } catch (e) { console.error(e.message); }
}
dumpAnySexPlayer();
