const axios = require('axios');

async function test() {
    const baseUrl = 'https://scrapper-hardgif-main.vercel.app';
    const id = 'desi-girl-shows-boobs-50'; // Slug ID

    console.log('--- Testing GET /details ---');
    try {
        const res = await axios.get(`${baseUrl}/details?id=${id}`);
        console.log('Status:', res.status, 'Title:', res.data.title);
    } catch (e) { console.error('GET /details failed', e.message); }

    console.log('\n--- Testing POST /details ---');
    try {
        const res = await axios.post(`${baseUrl}/details`, { id });
        console.log('Status:', res.status, 'Title:', res.data.title);
    } catch (e) { console.error('POST /details failed', e.message); }

    console.log('\n--- Testing GET /streams (expect Array) ---');
    try {
        const res = await axios.get(`${baseUrl}/streams?id=${id}`);
        console.log('Status:', res.status, 'Is Array:', Array.isArray(res.data));
        console.log('Stream URL:', res.data[0]?.url);
    } catch (e) { console.error('GET /streams failed', e.message); }

    console.log('\n--- Testing GET /fsiblog/streams (Alias) ---');
    try {
        const res = await axios.get(`${baseUrl}/fsiblog/streams?id=${id}`);
        console.log('Status:', res.status, 'Is Array:', Array.isArray(res.data));
    } catch (e) { console.error('Alias failed', e.message); }
}

test();
