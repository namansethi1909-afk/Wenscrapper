import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";
import { getAgentRandomRotation } from "../utils/userAgents";

export class Masa49 extends BaseSource {
    override baseUrl = "https://masa49.org";
    override headers = {
        "User-Agent": getAgentRandomRotation(),
        "Referer": "https://masa49.org/",
    };

    private async fetch(url: string): Promise<string> {
        try {
            console.log(`[Masa49] Fetching: ${url}`);
            const { data } = await axios.get(url, {
                headers: this.headers
            });
            return typeof data === 'string' ? data : JSON.stringify(data);
        } catch (e: any) {
            console.error('[Masa49] Fetch error:', e.message);
            throw e;
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];
        const items = $('.video_list li.video');

        console.log(`[Masa49] Found ${items.length} items`);

        items.each((i: any, el: any) => {
            const $el = $(el);
            const anchor = $el.find('a.thumb').first();
            const href = anchor.attr('href');
            // Title is in a separate anchor with class 'title'
            const titleAnchor = $el.find('a.title').first();
            const title = titleAnchor.text().trim() || titleAnchor.attr('title') || anchor.attr('title') || 'No Title';
            const poster = $el.find('img').attr('src') || '';

            const id = href ? href.replace(this.baseUrl, '').replace(/^\/+|\/+$/g, '') : '';

            // Debug logs commented out to keep output clean
            // if (i < 3) console.log(`[Item ${i}] Href: ${href} | ID: ${id} | Title: ${title}`);

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
        $('a[rel="tag"]').each((_: any, el: any) => { tags.push($(el).text().trim()); });

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
            const mp4Match = scripts.match(/https?:\/\/[^"']+\.mp4/);
            if (mp4Match) videoUrl = mp4Match[0];

            const fileMatch = scripts.match(/file\s*:\s*["']([^"']+)["']/);
            if (!videoUrl && fileMatch) videoUrl = fileMatch[1];
        }

        if (!videoUrl) {
            const iframe = $('iframe[src*="server"], iframe[src*="embed"]').attr('src');
            if (iframe) videoUrl = iframe;
        }

        // Validate videoUrl
        if (videoUrl) {
            // If it's the same as the page URL, discard it
            if (videoUrl === url || videoUrl.includes(cleanId)) {
                console.log(`[Masa49] Discarding self-referencing video URL: ${videoUrl}`);
                videoUrl = '';
            }

            // If it's a relative path, ignore it or fix it (masa49 usually uses absolute)
            if (videoUrl.startsWith('/')) {
                videoUrl = this.baseUrl + videoUrl;
            }
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
