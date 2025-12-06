const { FsiBlog } = require('./dist/scrapper/fsiblog.scrapper');
const scraper = new FsiBlog();

async function test() {
    // Use a known slug from previous test
    const id = 'desi-girl-shows-boobs-50';
    console.log(`Testing getDetails('${id}')...`);
    try {
        const details = await scraper.getDetails(id);
        console.log('Details found:', details.title);
        console.log('Video sources:', details.sources);

        console.log(`Testing getStreams('${id}')...`);
        const streams = await scraper.getStreams(id);
        console.log('Streams found:', streams.url);
    } catch (e) {
        console.error(e);
    }
}

test();
