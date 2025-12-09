const axios = require('axios');
axios.get('https://wenscrapper.onrender.com/')
    .then(r => {
        const id = r.data[0].id;
        console.log('ID:', id);
        return axios.get(`https://wenscrapper.onrender.com/streams?id=${encodeURIComponent(id)}`);
    })
    .then(r => console.log('URL:', r.data.url))
    .catch(e => console.log('Err:', e.message));
