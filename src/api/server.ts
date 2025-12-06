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
  const enriched = { ...item, type: 'video' };
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
app.get('/api/proxy', async (req, res) => {
  const { url, referer } = req.query;
  if (!url) return res.status(400).send('Missing url');

  try {
    const headers: any = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
    if (referer) headers['Referer'] = referer;

    // Stream the video
    const response = await axios({
      method: 'get',
      url: url as string,
      responseType: 'stream',
      headers
    });

    // Set Content-Type
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');

    response.data.pipe(res);
  } catch (e: any) {
    console.error('Proxy error:', e.message);
    res.status(500).send('Proxy Failed');
  }
});

// ---------------------------
// MAIN HANDLERS
// ---------------------------

const handleTrending = async (req: any, res: any) => { /* ... Unchanged ... */
  try {
    const page = getParam(req, 'page', 'p') || '1';
    const data = await withRetry(() => fsiblogScraper.getHome(page.toString()));
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json([]); }
};

const handleSearch = async (req: any, res: any) => { /* ... Unchanged ... */
  try {
    const q = getParam(req, 'q', 'query', 's', 'term', 'search');
    const page = getParam(req, 'page', 'p') || '1';
    if (!q) return res.status(400).json({ error: 'Missing search parameter' });
    const data = await withRetry(() => fsiblogScraper.getSearch(q.toString(), page.toString()));
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json([]); }
};

const handleDetails = async (req: any, res: any) => { /* ... Unchanged ... */
  try {
    const id = getParam(req, 'id', 'slug');
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });
    let data = await withRetry(() => fsiblogScraper.getDetails(id.toString()));
    if (data && data.suggestedVideo && typeof (data.suggestedVideo as any).then === 'function') {
      data.suggestedVideo = await data.suggestedVideo;
    }
    res.json(formatResponse(data));
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
};

// HYBRID + FUZZY + PROXY STREAM RESOLVER
const handleStreams = async (req: any, res: any) => {
  try {
    let id = getParam(req, 'id', 'slug');
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    console.log(`[Stream] ID: ${id}`);
    const idStr = id.toString();

    // 1. Get Details first to get TITLE for Fuzzy Search
    let title = idStr.replace(/-/g, ' '); // Fallback title
    try {
      const details = await fsiblogScraper.getDetails(idStr);
      if (details && details.title) title = details.title;
    } catch (e) { }

    // 2. Try Fuzzy Search on HardGif (for HLS)
    let hlsStream = null;
    try {
      // Search broad keywords (first 2 words of title)
      const keywords = title.split(' ').slice(0, 2).join(' ');
      const results = await hardgifScraper.getSearch(keywords, "1");

      // Find best match
      let bestMatch = null;
      let bestScore = 0;

      for (const r of results) {
        const score = getSimilarity(title, r.title);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = r;
        }
      }

      if (bestMatch && bestScore > 0.3) { // Threshold
        console.log(`[Stream] Fuzzy Match: ${bestMatch.title} (${bestScore.toFixed(2)})`);
        hlsStream = await hardgifScraper.getStreams(bestMatch.id);
      }
    } catch (e) { console.error('[Stream] Fuzzy failed', e); }

    if (hlsStream && hlsStream.url) {
      return res.json([formatResponse(hlsStream)]);
    }

    // 3. Fallback to FsiBlog (MP4) -> PROXY
    console.log('[Stream] Falling back to FsiBlog Proxy');
    const data = await withRetry(() => fsiblogScraper.getStreams(idStr));

    // If MP4, route through Proxy to force headers
    if (data && data.url && data.url.includes('.mp4')) {
      // Construct Proxy URL
      const hostname = req.headers.host; // e.g. scrapper-hardgif.vercel.app
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const proxyUrl = `${protocol}://${hostname}/api/proxy?url=${encodeURIComponent(data.url)}&referer=${encodeURIComponent('https://www.fsiblog.cc/')}`;

      data.url = proxyUrl; // REPLACE URL WITH PROXY
      (data as any).headers = {}; // Clear headers as Proxy handles them
    } else if (data) {
      // If not MP4 (maybe iframe?), inject headers just in case
      (data as any).headers = fsiblogScraper.headers;
      (data as any).userAgent = fsiblogScraper.headers['User-Agent'];
      (data as any).referer = fsiblogScraper.headers['Referer'];
    }

    res.json([formatResponse(data)]);

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
app.listen(PORT, () => { console.log(`Server running on ${PORT}`); });

export default app;
