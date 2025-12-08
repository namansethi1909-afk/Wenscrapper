
import { Masa49 } from './src/scrapper/masa49.scrapper';

async function testMasa() {
    console.log("Initializing Masa49 scrapper...");
    const scrapper = new Masa49();
    try {
        console.log("Testing Home...");
        const home = await scrapper.getHome();
        console.log("Home items:", home.length);
        if (home.length > 0) {
            console.log("First Home Item:", home[0]);

            const testId = home[0].id;
            console.log(`Testing Details for id: ${testId}...`);
            const details = await scrapper.getDetails(testId);
            console.log("Details Title:", details.title);
            console.log("Details Poster:", details.poster);

            console.log(`Testing Streams for id: ${testId}...`);
            const streams = await scrapper.getStreams(testId);
            console.log("Streams URL:", streams.url);
            console.log("Streams Quality:", streams.quality);
        }
    } catch (e) {
        console.error("Masa Error:", e);
    }
}

testMasa();
