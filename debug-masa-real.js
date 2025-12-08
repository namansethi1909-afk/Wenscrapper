
const { Masa49 } = require('./dist/scrapper/masa49.scrapper');

async function testMasa() {
    const scrapper = new Masa49();
    try {
        console.log("Testing Home...");
        const home = await scrapper.getHome();
        console.log("Home items:", home.length);
        if (home.length > 0) {
            console.log("First Home Item:", home[0]);
            console.log("Testing Details for first item...");
            const details = await scrapper.getDetails(home[0].id);
            console.log("Details:", details);
            console.log("Testing Streams for first item...");
            const streams = await scrapper.getStreams(home[0].id);
            console.log("Streams:", streams);
        }
    } catch (e) {
        console.error("Masa Error:", e);
    }
}

testMasa();
