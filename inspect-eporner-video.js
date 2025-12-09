const axios = require('axios');

async function inspectEpornerVideo() {
    const id = 'MHbze3BI4q6'; // From previous search
    const url = `https://www.eporner.com/video-${id}/_`;
    try {
        console.log(`Fetching ${url}...`);
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            timeout: 10000
        });

        const html = res.data;
        console.log('HTML Length:', html.length);

        // Log all script tags content that might contain "mp4"
        const mp4Matches = html.match(/"(https:[^"]+\.mp4[^"]*)"/g);
        if (mp4Matches) {
            console.log('MP4 Matches found:', mp4Matches.length);
            console.log('Sample:', mp4Matches[0]);
        } else {
            console.log('No direct "mp4" strings found in quotes.');
        }

        // Check for download links
        const dload = html.match(/\/dload\/[^"]+/);
        if (dload) console.log('Download link found:', dload[0]);

    } catch (e) {
        console.error(e.message);
    }
}
inspectEpornerVideo();
