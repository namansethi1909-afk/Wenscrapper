import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as cheerio from 'cheerio';
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";
import { getAgentRandomRotation } from "../utils/userAgents";

puppeteerExtra.use(StealthPlugin());

class BrowserManager {
    static instance: Browser | null = null;
    static launchPromise: Promise<Browser> | null = null;

    static async getBrowser(): Promise<Browser> {
        if (this.instance) {
            if (this.instance.isConnected()) return this.instance;
            this.instance = null;
        }

        if (this.launchPromise) return this.launchPromise;

        console.log('[Puppeteer] Launching new browser...');
        this.launchPromise = puppeteerExtra.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Memory optimization
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--js-flags="--max-old-space-size=256"', // Limit JS heap
                '--single-process' // Render recommendation
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
        }) as unknown as Promise<Browser>;

        this.instance = await this.launchPromise;
        this.launchPromise = null;
        return this.instance;
    }
}

export class Masa49 extends BaseSource {
    override baseUrl = "https://masa49.org";
    override headers = {
        "User-Agent": getAgentRandomRotation(),
        "Referer": "https://masa49.org/",
    };

    private async fetch(url: string): Promise<string> {
        let page: Page | null = null;
        try {
            const browser = await BrowserManager.getBrowser();
            console.log(`[Masa49] Opening page: ${url}`);
            page = await browser.newPage();

            // Aggressive Resource Blocking
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const type = req.resourceType();
                if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            await page.setUserAgent(this.headers['User-Agent']);

            // Go to page with strict timeout
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

            // Wait for selector to ensure content load
            try {
                await page.waitForSelector('.box', { timeout: 5000 });
            } catch (e) { console.log('[Masa49] Warning: .box not found, may be empty or blocked'); }

            const content = await page.content();
            return content;
        } catch (e: any) {
            console.error('[Masa49] Puppeteer error:', e.message);
            // Close browser on fatal errors to prevent zombies? 
            // Better to keep it open unless connection died.
            throw e;
        } finally {
            if (page) await page.close().catch(() => { });
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];
        const boxes = $('.box');

        console.log(`[Masa49] Found ${boxes.length} .box elements via Puppeteer`);

        if (boxes.length === 0) {
            const partial = html.substring(0, 500).replace(/\n/g, ' ');
            // Check if blocked by Cloudflare or similar
            const title = $('title').text();
            throw new Error(`[Masa49] 0 items found. Title: "${title}". Partial: ${partial}`);
        }

        boxes.each((_: any, el: any) => {
            const $el = $(el);
            const anchor = $el.find('a').first();
            const href = anchor.attr('href') || '';
            const title = anchor.attr('title') || $el.find('.title').text().trim() || 'No Title';
            const poster = $el.find('img').attr('src') || '';
            const id = href.replace(this.baseUrl, '').replace(/^\/+|\/+$/g, '');

            if (id && href) {
                results.push({
                    id,
                    title,
                    poster,
                    page: href,
                    provider: 'masa49',
                    keywords: [],
                    origin: 'search'
                } as Search);
            }
        });

        return results;
    }

    override async getHome(page?: string): Promise<Home[]> {
        const pageNum = parseInt(page || '1', 10);
        const url = pageNum > 1 ? `${this.baseUrl}/page/${pageNum}/` : `${this.baseUrl}/`;
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const pageNum = parseInt(page || '1', 10);
        const encodedQuery = encodeURIComponent(query);
        const url = pageNum > 1
            ? `${this.baseUrl}/page/${pageNum}/?s=${encodedQuery}`
            : `${this.baseUrl}/?s=${encodedQuery}`;
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getDetails(id: string): Promise<Details> {
        const cleanId = id.replace(this.baseUrl, '').replace(/^\/+|\/+$/g, '');
        const url = `${this.baseUrl}/${cleanId}/`;
        const html = await this.fetch(url);
        const $ = cheerio.load(html);

        const title = $('h1').first().text().trim() || cleanId;
        const description = $('.entry-content p').first().text().trim() || '';
        const poster = $('.entry-content img').first().attr('src') || '';

        const tags: string[] = [];
        $('a[rel="tag"]').each((_: any, el: any) => tags.push($(el).text().trim()));

        return {
            id: cleanId,
            headers: this.headers,
            poster,
            title,
            description,
            uploader: 'Masa49',
            upload_date: null,
            tags,
            suggestedVideo: [],
            seasons: []
        } as unknown as Details;
    }

    override async getStreams(id: string): Promise<Stream> {
        const cleanId = id.replace(this.baseUrl, '').replace(/^\/+|\/+$/g, '');
        const url = `${this.baseUrl}/${cleanId}/`;
        const html = await this.fetch(url);
        const $ = cheerio.load(html);

        let videoUrl = '';
        $('video source').each((_: any, el: any) => {
            const src = $(el).attr('src');
            if (src && !videoUrl) videoUrl = src;
        });

        if (!videoUrl) videoUrl = $('video').attr('src') || '';

        if (!videoUrl) {
            const scripts = $('script').text();
            const generic = scripts.match(/file\s*:\s*["']([^"']+\.mp4)["']/);
            if (generic) videoUrl = generic[1];
        }

        if (!videoUrl) {
            const iframe = $('iframe[src*="server"], iframe[src*="embed"]').attr('src');
            if (iframe) videoUrl = iframe;
        }

        console.log(`[Masa49] Stream URL: ${videoUrl}`);

        return {
            url: videoUrl,
            quality: 'auto',
            title: $('h1').text().trim(),
            qualities: [{ lang: 'auto', url: videoUrl || '' }],
            subtitles: []
        };
    }
}
