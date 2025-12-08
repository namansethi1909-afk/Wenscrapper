import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Masa49 } from '../scrapper/masa49.scrapper';
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const masa49Scraper = new Masa49();


const getParam = (req: any, ...keys: string[]) => {
  for (const key of keys) {
    if (req.params?.[key]) return req.params[key];
    if (req.body?.[key]) return req.body[key];
    if (req.query?.[key]) return req.query[key];
  }
  return null;
};

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 500): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (Array.isArray(result) && result.length === 0) throw new Error("Empty results");
      if (!result) throw new Error("Null result");
      return result;
    } catch (error) {
      lastError = error;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// MATCH WORKING API FORMAT EXACTLY - ONLY 3 FIELDS
const toSkymuteFormat = (item: any) => {
  return {
    title: item.title || 'Untitled',
    id: item.id || '',
    poster: item.poster || ''
  };
};

const formatResponse = (data: any) => {
  if (Array.isArray(data)) {
    return data.map(toSkymuteFormat);
  }
  return data;
};

const handleTrending = async (req: any, res: any) => {
  try {
    const page = getParam(req, 'page', 'p') || '1';
    const data = await withRetry(() => masa49Scraper.getHome(page.toString()));
    res.json(formatResponse(data));
  } catch (error: any) { res.status(500).json({ error: error.message, stack: error.stack }); }
};

const handleSearch = async (req: any, res: any) => {
  try {
    const q = getParam(req, 'q', 'query');
    const page = getParam(req, 'page', 'p') || '1';
    if (!q) return res.status(400).json({ error: 'Query parameter is required' });

    const data = await withRetry(() => masa49Scraper.getSearch(q.toString(), page.toString()));
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json([]); }
};

const handleDetails = async (req: any, res: any) => {
  try {
    const id = getParam(req, 'id');
    if (!id) return res.status(400).json({ error: 'ID parameter is required' });

    let data = await withRetry(() => masa49Scraper.getDetails(id.toString()));
    if (!data) return res.status(404).json({ error: 'Not found' });

    res.json(data);
  } catch (error) { res.status(500).json({}); }
};

const handleStreams = async (req: any, res: any) => {
  try {
    const id = getParam(req, 'id');
    if (!id) return res.json({ url: '', quality: 'auto', qualities: [] });

    const idStr = id.toString();
    const data = await withRetry(() => masa49Scraper.getStreams(idStr));
    res.json(data);
  } catch (error) { res.json({ url: '', quality: 'auto', qualities: [] }); }
};

app.get('/trending', handleTrending);
app.get('/search', handleSearch);
app.get('/details', handleDetails);
app.get('/streams', handleStreams);

app.get('/api/scrape', async (req: any, res: any) => {
  try {
    const query = req.query.keyword || req.query.q;
    if (!query) return res.json({ success: false, error: 'No query' });
    const data = await withRetry(() => masa49Scraper.getSearch(query as string));
    res.json({ success: true, data: formatResponse(data), source: 'masa49', timestamp: new Date().toISOString() });
  } catch (e) { res.json({ success: false, data: [] }); }
});

app.get("/", async (req: any, res: any) => {
  try {
    const data = await withRetry(() => masa49Scraper.getHome());
    const videosHTML = data.map((v: any) => `
      <div style="margin: 20px; border: 1px solid #ccc; padding: 10px;">
        <h3>${v.title}</h3>
        <img src="${v.poster}" width="200" />
        <p>ID: ${v.id}</p>
        <a href="/details?id=${v.id}">Details</a>
      </div>
    `).join('');
    res.send(`<!DOCTYPE html><html><body><h1>Status: Online (Masa49 FINAL FIX)</h1>${videosHTML}</body></html>`);
  } catch (e) { res.send(`Masa49 Scraper Online. Error: ${e}`); }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
