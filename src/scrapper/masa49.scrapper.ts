import { load } from "cheerio";
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";
import { getAgentRandomRotation } from "../utils/userAgents";

export class Masa49 extends BaseSource {
    override baseUrl = "https://masa49.org";
    override headers = {
        "User-Agent": getAgentRandomRotation(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://masa49.org/",
    };

    private async fetch(url: string): Promise<string> {
        try {
            // Bypass TS compilation of dynamic import by using eval
            // This ensures got-scraping (ESM) is loaded via native import() in Node.js
            const { gotScraping } = await (eval('import("got-scraping")') as Promise<any>);

            const { body } = await gotScraping({
                url,
                headerGeneratorOptions: {
                    browsers: [{ name: 'chrome', minVersion: 110 }],
                    devices: ['desktop'],
                    locales: ['en-US'],
                    operatingSystems: ['windows'],
                }
            });
            return body;
        } catch (e: any) {
            console.error('[Masa49] got-scraping error:', e.message);
            throw e;
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = load(html);
        const results: Search[] = [];

        console.log(`[Masa49] ParseIndex: HTML length ${html.length}`);
        const boxes = $('.box');
        console.log(`[Masa49] Found ${boxes.length} .box elements`);

        if (boxes.length === 0) {
            const partial = html.substring(0, 500).replace(/\n/g, ' ');
            const msg = `[Masa49] No items found. HTML len: ${html.length}. Posts: ${$('.post').length}. Partial: ${partial}`;
            console.log(msg);
            throw new Error(msg);
        }

        boxes.each((_: any, el: any) => {
            const $el = $(el);
            const anchor = $el.find('a').first();
            const href = anchor.attr('href') || '';
            const title = anchor.attr('title') || $el.find('.title').text().trim() || 'No Title';
            const poster = $el.find('img').attr('src') || '';

            // Extract ID from URL (e.g. https://masa49.org/video-name/ -> video-name)
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

        console.log(`[Masa49] Parsed ${results.length} items from ${boxes.length} boxes`);

        if (results.length === 0) {
            const msg = `[Masa49] Parsed 0 results (Boxes: ${boxes.length}). Partial HTML: ${html.substring(0, 100)}`;
            console.log(msg);
            throw new Error(msg);
        }

        return results;
    }

    override async getHome(page?: string): Promise<Home[]> {
        const pageNum = parseInt(page || '1', 10);
        const url = pageNum > 1
            ? `${this.baseUrl}/page/${pageNum}/`
            : `${this.baseUrl}/`;

        console.log(`[Masa49] Fetching home: ${url}`);
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const pageNum = parseInt(page || '1', 10);
        const encodedQuery = encodeURIComponent(query);
        const url = pageNum > 1
            ? `${this.baseUrl}/page/${pageNum}/?s=${encodedQuery}`
            : `${this.baseUrl}/?s=${encodedQuery}`;

        console.log(`[Masa49] Searching: ${url}`);
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getDetails(id: string): Promise<Details> {
        // ID is the slug, e.g. "video-name"
        const cleanId = id.replace(this.baseUrl, '').replace(/^\/+|\/+$/g, '');
        const url = `${this.baseUrl}/${cleanId}/`;

        console.log(`[Masa49] Details: ${url}`);
        const html = await this.fetch(url);
        const $ = load(html);

        const title = $('h1').first().text().trim() || cleanId;
        const description = $('.entry-content p').first().text().trim() || '';
        const poster = $('.entry-content img').first().attr('src') || '';

        // Tags
        const tags: string[] = [];
        $('a[rel="tag"]').each((_: any, el: any) => {
            tags.push($(el).text().trim());
        });

        const suggestedVideo = this.parseIndex(html).slice(0, 10);

        return {
            id: cleanId,
            headers: this.headers,
            poster,
            title,
            description,
            uploader: 'Masa49',
            upload_date: null,
            tags,
            suggestedVideo,
            seasons: []
        } as unknown as Details;
    }

    override async getStreams(id: string): Promise<Stream> {
        const cleanId = id.replace(this.baseUrl, '').replace(/^\/+|\/+$/g, '');
        const url = `${this.baseUrl}/${cleanId}/`;

        console.log(`[Masa49] Streams: ${url}`);
        const html = await this.fetch(url);
        const $ = load(html);

        let videoUrl = '';
        const qualities: Array<{ lang: string, url: string }> = [];

        // 1. Direct video tag
        $('video source').each((_: any, el: any) => {
            const src = $(el).attr('src');
            if (src && !videoUrl) videoUrl = src;
            if (src) qualities.push({ lang: 'auto', url: src });
        });

        if (!videoUrl) {
            videoUrl = $('video').attr('src') || '';
        }

        // 2. Generic file match in scripts
        if (!videoUrl) {
            const scripts = $('script').text();
            const generic = scripts.match(/file\s*:\s*["']([^"']+\.mp4)["']/);
            if (generic) videoUrl = generic[1];
        }

        // 3. Iframe fallback
        if (!videoUrl) {
            const iframe = $('iframe[src*="server"], iframe[src*="embed"]').attr('src');
            if (iframe) videoUrl = iframe;
        }

        console.log(`[Masa49] Found stream: ${videoUrl}`);

        return {
            url: videoUrl,
            quality: 'auto',
            title: $('h1').text().trim(),
            qualities: qualities.length > 0 ? qualities : [{ lang: 'auto', url: videoUrl }],
            subtitles: []
        };
    }
}
