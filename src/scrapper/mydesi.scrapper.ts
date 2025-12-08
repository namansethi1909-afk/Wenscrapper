import * as cheerio from "cheerio";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";
import { getAgentRandomRotation } from "../utils/userAgents";

puppeteer.use(StealthPlugin());

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

// Singleton Browser Manager
class BrowserManager {
    private static instance: any = null;
    private static launchPromise: Promise<any> | null = null;

    static async getBrowser() {
        if (this.instance) {
            if (this.instance.isConnected()) return this.instance;
            this.instance = null;
        }

        if (!this.launchPromise) {
            this.launchPromise = this.launch();
        }

        return this.launchPromise;
    }

    private static async launch() {
        try {
            const browser = await puppeteer.launch({
                headless: true, // New headless mode 'new' is default in newer versions
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // Important for low resource envs
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-extensions',
                    '--mute-audio',
                    '--disable-background-networking',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--headless=new',
                    '--js-flags="--max-old-space-size=128"' // Strictly limit JS heap
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                timeout: 60000
            });

            browser.on('disconnected', () => {
                console.log('[Browser] Disconnected');
                BrowserManager.instance = null;
                BrowserManager.launchPromise = null;
            });

            this.instance = browser;
            return browser;
        } catch (error) {
            console.error('[Browser] Launch error:', error);
            this.launchPromise = null;
            throw error;
        }
    }
}

export class MyDesi extends BaseSource {
    override baseUrl = "https://mydesi.click";
    override headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://mydesi.click/",
    };

    private async fetch(url: string, delayMs = 0): Promise<string> {
        if (delayMs > 0) await sleep(delayMs);
        let page;
        try {
            const browser = await BrowserManager.getBrowser();
            page = await browser.newPage();

            // Block heavy resources
            await page.setRequestInterception(true);
            page.on('request', (req: any) => {
                const resourceType = req.resourceType();
                if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            // Set headers
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9'
            });

            // Increase timeout slightly, waiting for DOM is usually enough
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

            // Wait for hydration/Cloudflare (8s to be safe)
            await sleep(8000);

            const content = await page.content();
            return content;
        } catch (e: any) {
            console.error('[MyDesi] Fetch error:', e.message);
            throw e;
        } finally {
            if (page) await page.close(); // Only close the page, keep browser open
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];

        // Common video listing patterns
        const selectors = [
            '.video-card', '.video-item', '.thumb',
            'article', '.post', '.item',
            'li.video', '.video-box', '.video'
        ];

        let items: any = $([]);
        for (const sel of selectors) {
            const found = $(sel);
            if (found.length > 0) {
                items = found;
                console.log(`[MyDesi] Found ${found.length} items with selector: ${sel}`);
                break;
            }
        }

        if (items.length === 0) {
            // Try finding any link with a video thumbnail
            items = $('a[href*="/video/"], a[href*="/watch/"], a[href*="/play/"]').parent();
        }

        items.each((_: number, el: any) => {
            const $el = $(el);

            // Try multiple patterns for href
            const href = $el.find('a').first().attr('href') ||
                $el.attr('href') ||
                $el.find('a[href*="/video/"]').attr('href') || '';

            // Try multiple patterns for title
            const title = $el.find('.title, .video-title, h3, h4, .name').first().text().trim() ||
                $el.find('a').attr('title') ||
                $el.find('img').attr('alt') || '';

            // Try multiple patterns for thumbnail
            const poster = $el.find('img').first().attr('src') ||
                $el.find('img').first().attr('data-src') ||
                $el.find('img').first().attr('data-lazy-src') || '';

            // Extract ID
            const idMatch = href.match(/\/(?:video|watch|play|v)\/([^\/]+)/i) ||
                href.match(/\/([^\/]+)\/?$/);
            const id = idMatch ? idMatch[1].replace(/\/$/, '') : '';

            // Duration
            const durationText = $el.find('.duration, .time, .video-duration').text().trim();
            const duration = durationText ? this.parseDuration(durationText) : null;

            if (id && title) {
                results.push({
                    id,
                    title,
                    poster: poster || '',
                    page: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                    provider: this.baseUrl,
                    keywords: [],
                    origin: 'search',
                    durationSeconds: duration,
                } as Search);
            }
        });

        return results;
    }

    private parseDuration(text: string): number | null {
        const parts = text.split(':').map(p => parseInt(p, 10));
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        return null;
    }

    override async getHome(page?: string): Promise<Home[]> {
        const pageNum = parseInt(page || '1', 10);
        const url = pageNum > 1
            ? `${this.baseUrl}/page/${pageNum}/`
            : `${this.baseUrl}/`;

        console.log(`[MyDesi] Fetching home page: ${url}`);
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const pageNum = parseInt(page || '1', 10);
        const encodedQuery = encodeURIComponent(query);
        const url = pageNum > 1
            ? `${this.baseUrl}/page/${pageNum}/?s=${encodedQuery}`
            : `${this.baseUrl}/?s=${encodedQuery}`;

        console.log(`[MyDesi] Searching: ${url}`);
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getDetails(id: string): Promise<Details> {
        const pageUrl = /^(https?:)?\//.test(id)
            ? id
            : `${this.baseUrl}/${id.replace(/^\/+|\/+$/g, "")}/`;

        console.log(`[MyDesi] Fetching details: ${pageUrl}`);
        const html = await this.fetch(pageUrl);
        const $ = cheerio.load(html);

        const title = $('h1, .video-title, .title').first().text().trim() ||
            $('title').text().split('|')[0].trim() || id;

        const description = $('meta[name="description"]').attr('content') ||
            $('.description, .video-description, .content p').first().text().trim() || '';

        const poster = $('meta[property="og:image"]').attr('content') ||
            $('video').attr('poster') ||
            $('img.video-poster, .player img').first().attr('src') || '';

        const tags = $('a.tag, .tags a, a[rel="tag"]').map((_, a) => $(a).text().trim()).get();

        const suggestedVideo = this.parseIndex(html).slice(0, 10);

        return {
            id,
            headers: this.headers,
            poster,
            title,
            description,
            uploader: null,
            upload_date: null,
            tags,
            suggestedVideo,
            seasons: [{ title: "video", poster, episodes: [{ id, title }] }],
        } as unknown as Details;
    }

    override async getStreams(id: string): Promise<Stream> {
        const pageUrl = /^(https?:)?\//.test(id)
            ? id
            : `${this.baseUrl}/${id.replace(/^\/+|\/+$/g, "")}/`;

        console.log(`[MyDesi] Fetching streams: ${pageUrl}`);
        const html = await this.fetch(pageUrl);
        const $ = cheerio.load(html);

        const title = $('h1, .video-title').first().text().trim() || id;

        let videoUrl = '';
        const qualities: Array<{ lang: string, url: string }> = [];

        $('video source').each((_, s) => {
            const src = $(s).attr('src');
            const quality = $(s).attr('label') || $(s).attr('title') || 'auto';
            if (src) {
                qualities.push({ lang: quality, url: src });
                if (!videoUrl) videoUrl = src;
            }
        });

        if (!videoUrl) videoUrl = $('video').attr('src') || '';
        if (!videoUrl) {
            const iframe = $('iframe[src*="video"], iframe[src*="embed"], iframe[src*="player"]').attr('src');
            if (iframe) videoUrl = iframe;
        }
        if (!videoUrl) {
            const scriptMatch = html.match(/(?:file|source|video_url|videoUrl)['":\s]+['"](https?:\/\/[^'"]+(?:\.mp4|\.m3u8)[^'"]*)['"]/i);
            if (scriptMatch) videoUrl = scriptMatch[1];
        }
        if (!videoUrl) {
            const mp4Match = html.match(/(https?:\/\/[^'"<>\s]+\.(?:mp4|m3u8)[^'"<>\s]*)/i);
            if (mp4Match) videoUrl = mp4Match[1];
        }

        console.log(`[MyDesi] Found video URL: ${videoUrl || 'NONE'}`);

        return {
            url: videoUrl,
            quality: qualities.length > 0 ? qualities[0].lang : 'auto',
            title,
            qualities,
            subtitles: [],
        };
    }
}
