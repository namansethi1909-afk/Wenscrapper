
const axios = require('axios');

async function testAxios() {
    try {
        console.log("Fetching masa49 with axios...");
        const res = await axios.get('https://masa49.org/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log("Status:", res.status);
        console.log("Length:", res.data.length);
        if (res.data.includes('box')) {
            console.log("Found .box class in HTML");
        } else {
            console.log("Did NOT find .box class");
        }
    } catch (e) {
        console.error("Axios Error:", e.message);
    }
}
testAxios();
