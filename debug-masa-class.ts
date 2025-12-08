
import { Masa49 } from "./src/scrapper/masa49.scrapper";

async function run() {
    const scrapper = new Masa49();
    console.log("Testing getHome...");
    try {
        const home = await scrapper.getHome("1");
        console.log("Home results:", home.length);
        if (home.length > 0) {
            console.log("First item:", home[0]);

            // Test Details
            const firstId = home[0].id; // e.g. "some-video"
            const fullId = home[0].page; // e.g. "https://masa49.org/some-video/"

            console.log(`Testing getDetails for ${fullId}...`);
            const details = await scrapper.getDetails(fullId);
            console.log("Details found:", details.title);

            console.log(`Testing getStreams for ${fullId}...`);
            const streams = await scrapper.getStreams(fullId);
            console.log("Streams found:", streams);
        }
    } catch (e) {
        console.error("Error in Masa49:", e);
    }
}

run();
