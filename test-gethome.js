// Run compiled version
const { FsiBlog } = require('./dist/scrapper/fsiblog.scrapper');
const scraper = new FsiBlog();

async function test() {
    console.log('Testing getHome()...');
    const data = await scraper.getHome();
    console.log('First 3 videos:');
    data.slice(0, 3).forEach((video, i) => {
        console.log(`Video ${i + 1}: id="${video.id}" page="${video.page}"`);
    });
}

test().catch(console.error);
