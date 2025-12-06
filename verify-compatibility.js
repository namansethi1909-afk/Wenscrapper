const axios = require('axios');

async function test() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';

    console.log('--- Testing Search /fsiblog/search (GET & POST) ---');
    try {
        // GET search with page
        const resGet = await axios.get(`${baseUrl}/fsiblog/search?q=desi&page=1`);
        console.log('GET Search Status:', resGet.status, 'Results:', resGet.data.length);

        // POST search with page
        const resPost = await axios.post(`${baseUrl}/fsiblog/search`, { q: 'desi', page: 2 });
        console.log('POST Search (pg 2) Status:', resPost.status, 'First Result:', resPost.data[0]?.title);
    } catch (e) { console.error('Search failed', e.message); }

    console.log('\n--- Testing Trending Pagination ---');
    try {
        const resPg1 = await axios.get(`${baseUrl}/trending?page=1`);
        const val1 = resPg1.data[0]?.id;

        const resPg2 = await axios.get(`${baseUrl}/trending?page=2`);
        const val2 = resPg2.data[0]?.id;

        console.log('Page 1 first ID:', val1);
        console.log('Page 2 first ID:', val2);
        if (val1 !== val2) console.log('✅ Pagination working (content differs)');
        else console.log('❌ Pagination might be ignored (content same)');
    } catch (e) { console.error('Pagination failed', e.message); }
}

test();
