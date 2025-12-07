import * as cheerio from "cheerio";
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";
import { getAgentRandomRotation } from "../utils/userAgents";

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

export class MyDesi extends BaseSource {
    override baseUrl = "https://mydesi.click";
    override headers = {
        "User-Agent": getAgentRandomRotation(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://mydesi.click/",
    };

    private async fetch(url: string, delayMs = 0): Promise<string> {
        if (delayMs > 0) await sleep(delayMs);
        try {
            // Dynamic import for ESM package in CommonJS environment
            const { gotScraping } = await import('got-scraping');
            const response = await gotScraping({
                url,
                headerGeneratorOptions: {
                    browsers: [{ name: 'chrome', minVersion: 110 }],
                    devices: ['desktop'],
                    locales: ['en-US'],
                    operatingSystems: ['windows'],
                },
                timeout: { request: 30000 }
            });
            return response.body;
        } catch (e: any) {
            console.error('[MyDesi] Fetch error:', e.message);
            throw e;
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];

        // Common video listing patterns - will be refined after testing
        // Try multiple selectors
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

            // Extract ID from href
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
        // Build the video page URL
        const pageUrl = /^(https?:)?\//.test(id)
            ? id
            : `${this.baseUrl}/${id.replace(/^\/+|\/+$/g, "")}/`;

        console.log(`[MyDesi] Fetching details: ${pageUrl}`);
        const html = await this.fetch(pageUrl);
        const $ = cheerio.load(html);

        // Extract video info
        const title = $('h1, .video-title, .title').first().text().trim() ||
            $('title').text().split('|')[0].trim() || id;

        const description = $('meta[name="description"]').attr('content') ||
            $('.description, .video-description, .content p').first().text().trim() || '';

        const poster = $('meta[property="og:image"]').attr('content') ||
            $('video').attr('poster') ||
            $('img.video-poster, .player img').first().attr('src') || '';

        const tags = $('a.tag, .tags a, a[rel="tag"]').map((_, a) => $(a).text().trim()).get();

        // Get suggested videos
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
        // Build the video page URL
        const pageUrl = /^(https?:)?\//.test(id)
            ? id
            : `${this.baseUrl}/${id.replace(/^\/+|\/+$/g, "")}/`;

        console.log(`[MyDesi] Fetching streams: ${pageUrl}`);
        const html = await this.fetch(pageUrl);
        const $ = cheerio.load(html);

        const title = $('h1, .video-title').first().text().trim() || id;

        // Try multiple patterns to find video URL
        let videoUrl = '';
        const qualities: Array<{ lang: string, url: string }> = [];

        // Pattern 1: video source tag
        $('video source').each((_, s) => {
            const src = $(s).attr('src');
            const quality = $(s).attr('label') || $(s).attr('title') || 'auto';
            if (src) {
                qualities.push({ lang: quality, url: src });
                if (!videoUrl) videoUrl = src;
            }
        });

        // Pattern 2: video src attribute
        if (!videoUrl) {
            videoUrl = $('video').attr('src') || '';
        }

        // Pattern 3: player embed/iframe
        if (!videoUrl) {
            const iframe = $('iframe[src*="video"], iframe[src*="embed"], iframe[src*="player"]').attr('src');
            if (iframe) videoUrl = iframe;
        }

        // Pattern 4: JW Player or other player config
        if (!videoUrl) {
            const scriptMatch = html.match(/(?:file|source|video_url|videoUrl)['":\s]+['"](https?:\/\/[^'"]+(?:\.mp4|\.m3u8)[^'"]*)['"]/i);
            if (scriptMatch) videoUrl = scriptMatch[1];
        }

        // Pattern 5: Look for .mp4 or .m3u8 URLs anywhere in script tags
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
