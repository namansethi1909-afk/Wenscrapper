const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

async function test() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: "new", // Try new headless
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 }); // Set viewport

        console.log('Navigating to mydesi.click...');
        await page.goto('https://mydesi.click/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        console.log('Waiting for Cloudflare (20s)...');

        // Improve evasion: Move mouse
        await page.mouse.move(100, 100);
        await page.mouse.down();
        await page.mouse.move(200, 200);
        await page.mouse.up();

        // Wait longer
        await new Promise(r => setTimeout(r, 10000));

        // Check if still stuck
        let title = await page.title();
        console.log('Title after 10s:', title);

        if (title.includes('Just a moment')) {
            console.log('Still blocked. Trying to find checkbox...');
            // Try to find challenge iframe
            const frames = page.frames();
            for (const frame of frames) {
                const text = await frame.content();
                if (text.includes('Verify you are human')) {
                    console.log('Found verification frame. Clicking...');
                    const box = await frame.$('input[type="checkbox"]');
                    if (box) await box.click();
                    else {
                        // Click center of frame
                        await page.mouse.click(300, 300); // Blind guess
                    }
                }
            }
            await new Promise(r => setTimeout(r, 10000));
        }

        const content = await page.content();
        title = await page.title();
        console.log('Final Page Title:', title);

        const $ = cheerio.load(content);
        const videos = [];
        $('.video-card, .video-item, .thumb, article').each((i, el) => {
            const t = $(el).find('a').attr('title') || $(el).find('img').attr('alt');
            if (t) videos.push(t);
        });

        console.log('Found videos:', videos.length);
        if (videos.length > 0) {
            console.log('Sample video:', videos[0]);
        } else {
            console.log('Still blocked? HTML partial:', content.substring(0, 200));
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

test();
