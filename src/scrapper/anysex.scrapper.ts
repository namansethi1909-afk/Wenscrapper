import * as cheerio from "cheerio";
import axios from 'axios';
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";

export class AnySex extends BaseSource {
    override baseUrl = "https://anysex.com";
    override headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://anysex.com/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Connection": "keep-alive"
    };

    private async fetch(url: string): Promise<string> {
        try {
            const { data } = await axios.get(url, {
                headers: this.headers,
                timeout: 15000, // Increased timeout 
                maxContentLength: Infinity
            });
            return data;
        } catch (error: any) {
            console.error(`[AnySex] Fetch error for ${url}:`, error.message);
            return "";
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];

        // AnySex videos usually list items with class 'item' or similar
        // Looking at dump, we saw links to /videos/
        const items = $('.item, .videos_list .item, .video-item, div[class*="video"]');

        // Fallback: search all anchors with /videos/ if items not found effectively
        const anchors = $('a[href*="/videos/"]');

        anchors.each((_, el) => {
            const $el = $(el);
            const img = $el.find('img');

            // Heuristic: Must have image or be substantial
            if (img.length === 0) return;

            const href = $el.attr('href') || "";
            // Skip tags/categories
            if (!href.match(/\/videos\/[0-9]+\//) && !href.match(/\/videos\/[a-z0-9-]+\//)) return;

            // ID is usually in the URL
            // e.g. /videos/12345/title/
            // or /videos/title-12345/

            // Let's use the slug as ID
            const idMatch = href.match(/\/videos\/([^\/]+)\/?/);
            const id = idMatch ? idMatch[1] : "";
            if (!id) return;

            if (results.find(r => r.id === id)) return;

            const title = $el.attr('title') || img.attr('alt') || $el.text().trim() || "Untitled";
            let poster = img.attr('src') || img.attr('data-src') || "";
            if (poster && poster.startsWith('//')) poster = 'https:' + poster;

            results.push({
                id,
                title,
                poster,
                page: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                provider: 'anysex',
                keywords: [],
                origin: 'search'
            } as Search);
        });

        console.log(`[AnySex] Parsed ${results.length} videos`);
        return results;
    }

    override async getHome(page?: string): Promise<Home[]> {
        const url = this.baseUrl;
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const q = encodeURIComponent(query).replace(/%20/g, '+');
        const url = `${this.baseUrl}/search/?q=${q}`;
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getDetails(id: string): Promise<Details> {
        return {
            id,
            title: id,
            poster: "",
            headers: {},
            description: "",
            uploader: null,
            upload_date: null,
            tags: [],
            suggestedVideo: [],
            seasons: []
        } as any;
    }

    override async getStreams(id: string): Promise<Stream> {
        const url = `${this.baseUrl}/videos/${id}/`;
        const html = await this.fetch(url);

        let videoUrl = "";

        // Regex for MP4
        const mp4Match = html.match(/video_url\s*[:=]\s*['"](https?:\/\/[^'"]+\.mp4[^'"]*)['"]/i) ||
            html.match(/file\s*:\s*['"](https?:\/\/[^'"]+\.mp4[^'"]*)['"]/i) ||
            html.match(/source\s*src\s*=\s*['"](https?:\/\/[^'"]+\.mp4[^'"]*)['"]/i) ||
            html.match(/(https?:\/\/[^"']+\.mp4[^"']*)/i);

        if (mp4Match) videoUrl = mp4Match[1];

        console.log(`[AnySex] Stream for ${id}: ${videoUrl ? 'FOUND' : 'MISSING'}`);

        return {
            url: videoUrl,
            quality: 'auto',
            title: id,
            qualities: [],
            subtitles: []
        };
    }
}
