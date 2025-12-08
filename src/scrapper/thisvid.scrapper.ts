import * as cheerio from "cheerio";
import axios from 'axios';
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";

export class ThisVid extends BaseSource {
    override baseUrl = "https://thisvid.com";
    override headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://thisvid.com/"
    };

    private async fetch(url: string): Promise<string> {
        try {
            const { data } = await axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });
            return data;
        } catch (error: any) {
            console.error(`[ThisVid] Fetch error for ${url}:`, error.message);
            return "";
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];

        // Target anchors with /videos/
        const videoLinks = $('a[href*="/videos/"]');

        videoLinks.each((_, el) => {
            const $el = $(el);
            // Verify if it's a real video thumb block (has image or class)
            const img = $el.find('img');
            // If no image inside, maybe it's just a text link? Skip.
            // But sometimes the link wraps the image.
            if (img.length === 0 && !$el.hasClass('video-thumb') && !$el.parent().hasClass('video-thumb')) {
                // heuristic: if it has no image children, skip reasonable?
                // Let's rely on finding an ID.
            }
            // Actually, keep it simple. If it matches /videos/slug/ and has title, take it.

            const href = $el.attr('href') || "";
            if (!href.includes('/videos/') || href.includes('/videos/best/')) return;

            // Extract ID from href (slug)
            const idMatch = href.match(/\/videos\/([^\/]+)\/?/);
            const id = idMatch ? idMatch[1] : "";
            if (!id) return;

            const title = $el.attr('title') || img.attr('alt') || $el.text().trim() || "Untitled";
            // if title is empty or generic, skip
            if (!title || title.length < 2) return;

            let poster = img.attr('src') || img.attr('data-src') || "";
            if (poster.startsWith('//')) poster = 'https:' + poster;

            // Avoid duplicates in this batch
            if (results.find(r => r.id === id)) return;

            results.push({
                id,
                title,
                poster,
                page: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                provider: 'thisvid',
                keywords: [],
                origin: 'search'
            } as Search);
        });

        console.log(`[ThisVid] Parsed ${results.length} videos`);
        return results;
    }

    override async getHome(page?: string): Promise<Home[]> {
        const url = this.baseUrl;
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const q = encodeURIComponent(query).replace(/%20/g, '+');
        const url = `${this.baseUrl}/search/${q}/`;
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

        // Regex extract MP4
        const mp4Match = html.match(/file\s*:\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i) ||
            html.match(/source\s*src\s*=\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i) ||
            html.match(/(https?:\/\/[^"']+\.mp4[^"']*)/i);

        if (mp4Match) videoUrl = mp4Match[1];

        console.log(`[ThisVid] Stream for ${id}: ${videoUrl ? 'FOUND' : 'MISSING'}`);

        return {
            url: videoUrl,
            quality: 'auto',
            title: id,
            qualities: [],
            subtitles: []
        };
    }
}
