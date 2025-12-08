const axios = require('axios');

async function dumpHClipsSmart() {
    try {
        console.log('Fetching hclips...');
        const res = await axios.get('https://hclips.com', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        console.log('Searching for patterns...');
        const html = res.data;

        // Find video links
        const videoLinks = html.match(/href="\/video\/[^"]+"/g);
        if (videoLinks) {
            console.log('Found video links:', videoLinks.slice(0, 3));

            // Fetch one video page
            const firstLink = videoLinks[0].match(/"(\/video\/[^"]+)"/)[1];
            const fullUrl = 'https://hclips.com' + firstLink;
            console.log('Fetching detail page:', fullUrl);

            const detailRes = await axios.get(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const detailHtml = detailRes.data;

            // Look for MP4 or video source
            const mp4 = detailHtml.match(/https?:\/\/[^"]+\.mp4/);
            if (mp4) console.log('✅ Found MP4:', mp4[0]);

            const source = detailHtml.match(/<source[^>]+src="([^"]+)"/);
            if (source) console.log('✅ Found source src:', source[1]);

        } else {
            console.log('❌ No video links found in root');
        }
    } catch (e) { console.error('Error:', e.message); }
}
dumpHClipsSmart();
