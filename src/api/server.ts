import express from 'express';
import cors from 'cors';
import axios from 'axios';
// import { Eporner } from '../scrapper/eporner.scrapper';
import { XNXX } from '../scrapper/xnxx.scrapper';
import { proxyVideo } from '../controllers/proxy.controller';

// Initialize Scraper (Switching to XNXX for direct MP4 extraction - Skymute requirement)
// const activeScraper = new Eporner();
const activeScraper = new XNXX();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const wrapProxy = (url: string) => {
  if (url && url.startsWith('http')) {
    return `https://wenscrapper.onrender.com/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

// MATCH WORKING API FORMAT + ADD VIDEO URLs
const toSkymuteFormat = (item: any) => {
  return {
    title: item.title || 'Untitled',
    id: item.id || '',
    poster: item.poster || '',
    url: item.videoUrl || '' // Direct MP4 stream URL
  };
};

const formatResponse = async (data: any) => {
  if (Array.isArray(data)) {
    // Fetch video URLs in parallel for all items
    const promises = data.map(async (item) => {
      try {
        const streams = await activeScraper.getStreams(item.id);
        const proxiedUrl = wrapProxy(streams.url || '');
        return { ...item, videoUrl: proxiedUrl };
      } catch (e) {
        console.error(`[Server] Failed to get stream for ${item.id}:`, e);
        return { ...item, videoUrl: '' };
      }
    });

    const enrichedData = await Promise.all(promises);
    return enrichedData.map(toSkymuteFormat);
  }
  return data;
};

const handleTrending = async (req: any, res: any) => {
  try {
    const page = getParam(req, 'page', 'p') || '1';
    const data = await withRetry(() => activeScraper.getHome(page.toString()));
    const formatted = await formatResponse(data); // Now async
    res.json(formatted);
  } catch (error: any) { res.status(500).json({ error: error.message, stack: error.stack }); }
};

const handleSearch = async (req: any, res: any) => {
  try {
    const q = getParam(req, 'q', 'query');
    const page = getParam(req, 'page', 'p') || '1';
    if (!q) return res.status(400).json({ error: 'Query parameter is required' });

    const data = await withRetry(() => activeScraper.getSearch(q.toString(), page.toString()));
    const formatted = await formatResponse(data); // Now async
    res.json(formatted);
  } catch (error) { res.status(500).json([]); }
};

const handleDetails = async (req: any, res: any) => {
  try {
    const id = getParam(req, 'id');
    if (!id) return res.status(400).json({ error: 'ID parameter is required' });

    let data = await withRetry(() => activeScraper.getDetails(id.toString()));
    if (!data) return res.status(404).json({ error: 'Not found' });

    res.json(data);
  } catch (error) { res.status(500).json({}); }
};

const handleStreams = async (req: any, res: any) => {
  try {
    const id = getParam(req, 'id');
    if (!id) return res.json({ url: '', quality: 'auto', qualities: [] });

    const idStr = id.toString();
    const data = await withRetry(() => activeScraper.getStreams(idStr));

    // Wrap endpoint in proxy if it exists
    data.url = wrapProxy(data.url || '');

    res.json(data);
  } catch (error) { res.json({ url: '', quality: 'auto', qualities: [] }); }
};

app.get('/proxy', proxyVideo);
app.get('/trending', handleTrending);
app.get('/search', handleSearch);
app.get('/details', handleDetails);
app.get('/streams', handleStreams);

// Default to Trending for Root
app.get('/', handleTrending);

app.get('/api/scrape', async (req: any, res: any) => {
  try {
    const query = req.query.keyword || req.query.q;
    if (!query) return res.json({ success: false, error: 'No query' });
    const data = await withRetry(() => activeScraper.getSearch(query as string));
    res.json({ success: true, data: formatResponse(data), source: 'masa49', timestamp: new Date().toISOString() });
  } catch (e) { res.json({ success: false, data: [] }); }
});

app.get('/version', (req, res) => res.json({ version: 'v1.0.6-proxy-global', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
