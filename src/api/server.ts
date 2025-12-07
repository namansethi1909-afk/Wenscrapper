import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { FsiBlog } from '../scrapper/fsiblog.scrapper';
import { HardGif } from '../scrapper/hardgif.scrapper';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fsiblogScraper = new FsiBlog();
const hardgifScraper = new HardGif();

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

// Helper: Similarity Score (Jaccard)
function getSimilarity(s1: string, s2: string) {
  const t1 = new Set(s1.toLowerCase().split(/[\s-]+/));
  const t2 = new Set(s2.toLowerCase().split(/[\s-]+/));
  const intersection = new Set([...t1].filter(x => t2.has(x)));
  const union = new Set([...t1, ...t2]);
  return intersection.size / union.size;
}

const enrichVideo = (item: any) => {
  // Respect existing type if set (e.g. 'webview'), default to 'video'
  const enriched = { ...item, type: item.type || 'video' };
  // Add Proxy URL property if needed by App (some apps check specific keys)
  if (item.url && item.url.includes('.mp4')) {
    // We will replace the URL in final formatting if we choose Proxy
  }
  if (item.headers) {
    if (item.headers['User-Agent']) enriched.userAgent = item.headers['User-Agent'];
    if (item.headers['Referer']) enriched.referer = item.headers['Referer'];
  }
  return enriched;
};

const formatResponse = (data: any) => {
  if (Array.isArray(data)) return data.map(enrichVideo);
  if (data && typeof data === 'object') {
    if (data.suggestedVideo && Array.isArray(data.suggestedVideo)) {
      data.suggestedVideo = data.suggestedVideo.map(enrichVideo);
    }
    return enrichVideo(data);
  }
  return data;
};

// ---------------------------
// PROXY HANDLER
// ---------------------------
// ---------------------------
// PROXY HANDLER (With Range Support)
// ---------------------------
app.get('/api/proxy', async (req, res) => {
  const { url, referer } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
    const headers: any = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    if (referer) headers['Referer'] = referer;

    // Forward Range header if present (Critical for seeking/streaming)
    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    // Stream the video
    const response = await axios({
      method: 'get',
      url: url as string,
      responseType: 'stream',
      headers,
      validateStatus: () => true // Accept 206, 200, etc.
    });

    // Forward important headers to client
    const headersToForward = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
    headersToForward.forEach(h => {
      if (response.headers[h]) res.setHeader(h, response.headers[h]);
    });

    res.status(response.status); // Forward status (e.g., 206)
    res.setHeader('Access-Control-Allow-Origin', '*');

    response.data.pipe(res);
  } catch (e: any) {
    console.error('Proxy error:', e.message);
    if (!res.headersSent) res.status(500).send('Proxy Failed');
  }
});

// ---------------------------
// MAIN HANDLERS
// ---------------------------

const handleTrending = async (req: any, res: any) => {
  try {
    const page = getParam(req, 'page', 'p') || '1';
    const data = await withRetry(() => hardgifScraper.getHome(page.toString()));
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json([]); }
};

const handleSearch = async (req: any, res: any) => {
  try {
    const q = getParam(req, 'q', 'query', 's', 'term', 'search');
    const page = getParam(req, 'page', 'p') || '1';
    if (!q) return res.status(400).json({ error: 'Missing search parameter' });
    const data = await withRetry(() => hardgifScraper.getSearch(q.toString(), page.toString()));
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json([]); }
};

const handleDetails = async (req: any, res: any) => {
  try {
    const id = getParam(req, 'id', 'slug');
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });
    let data = await withRetry(() => hardgifScraper.getDetails(id.toString()));
    if (data && data.suggestedVideo && typeof (data.suggestedVideo as any).then === 'function') {
      data.suggestedVideo = await data.suggestedVideo;
    }
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

// SIMPLE HARDGIF STREAM HANDLER
const handleStreams = async (req: any, res: any) => {
  try {
    let id = getParam(req, 'id', 'slug');
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    console.log(`[Stream] ID: ${id}`);
    const idStr = id.toString();

    // Get HardGif stream directly
    const data = await withRetry(() => hardgifScraper.getStreams(idStr));

    if (data && data.url) {
      return res.json([formatResponse(data)]);
    }

    res.status(404).json({ error: 'Stream not found' });
  } catch (error) {
    console.error('Streams error:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
};

// Routes
app.all('/trending', handleTrending);
app.all('/fsiblog/trending', handleTrending);
app.all('/hardgif/trending', handleTrending);

app.all('/search', handleSearch);
app.all('/api/search', handleSearch);
app.all('/fsiblog/search', handleSearch);
app.all('/search/:q', handleSearch);
app.all('/hardgif/search/:q', handleSearch);

app.all('/details', handleDetails);
app.all('/fsiblog/details', handleDetails);
app.all('/hardgif/details', handleDetails);

app.all('/streams', handleStreams);
app.all('/fsiblog/streams', handleStreams);
app.all('/hardgif/streams', handleStreams);

// Legacy Root
app.get('/api/scrape', async (req, res) => { /* ... */
  try {
    const { source = 'fsiblog', query = '' } = req.query;
    let data;
    if (source === 'fsiblog') {
      data = await withRetry(() => fsiblogScraper.getSearch(query as string));
    } else {
      data = await hardgifScraper.getSearch(query as string);
    }
    res.json({ success: true, data: formatResponse(data), source, timestamp: new Date().toISOString() });
  } catch (error) { res.status(500).json({ success: false, error: 'Failed' }); }
});

app.get('/', async (req, res) => {
  try {
    const data = await withRetry(() => fsiblogScraper.getHome());
    const videosHTML = data.map((video: any) => `
      <div class="video-card" onclick="window.open('${video.page || '#'}', '_blank')">
        <img src="${video.poster}" alt="${video.title}" class="video-thumbnail" onerror="this.src='https://via.placeholder.com/324x200/1a1a2e/ffffff?text=No+Image'">
        <div class="video-title">${video.title}</div>
      </div>
    `).join('');
    res.send(`<!DOCTYPE html><html><body><h1>Status: Online (Proxy Active)</h1>${videosHTML}</body></html>`);
  } catch (error) { res.status(500).send('<h1>Status: Upstream Error</h1>'); }
});

app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on ${PORT} (0.0.0.0)`);
});

export default app;
