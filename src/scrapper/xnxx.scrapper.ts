import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";

export class XNXX extends BaseSource {
    override baseUrl = "https://www.xnxx.com";
    override headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    };

    private async fetch(url: string): Promise<string> {
        try {
            const { data } = await axios.get(url, {
                headers: this.headers,
                timeout: 15000
            });
            return data;
        } catch (error: any) {
            console.error(`[XNXX] Fetch error for ${url}:`, error.message);
            return "";
        }
    }

    private parseIndex(html: string): Search[] {
        const $ = cheerio.load(html);
        const results: Search[] = [];

        $('.thumb-block').each((_, el) => {
            const $el = $(el);
            // XNXX structure: .thumb-indside -> .thumb > a > img
            const thumbInd = $el.find('.thumb-inside');
            const thumbLink = thumbInd.find('.thumb > a');
            const img = thumbLink.find('img');
            const titleLink = thumbInd.find('.thumb-under > p > a');

            const href = thumbLink.attr('href') || titleLink.attr('href');
            if (!href) return;

            // XNXX IDs are inside URL: /video-12345/title
            // or just use href as ID if we map loosely? 
            // Better to extract meaningful ID
            const idMatch = href.match(/video-([a-z0-9]+)\//);
            const id = idMatch ? idMatch[1] : href.replace(/\//g, '_'); // fallback safe ID

            const title = titleLink.attr('title') || img.attr('title') || "Untitled";
            let poster = img.attr('src') || img.attr('data-src') || "";

            results.push({
                id: href, // Store full path as ID to make details fetching easier
                title,
                poster
            });
        });

        console.log(`[XNXX] Parsed ${results.length} videos`);
        return results;
    }

    override async getHome(page?: string): Promise<Home[]> {
        // XNXX home usually has categories, let's target 'best' or 'hits'
        const url = `${this.baseUrl}/hits/${page || ''}`; // e.g /hits/2023-11
        const html = await this.fetch(url.endsWith('/') ? url : url + '/');
        return this.parseIndex(html);
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const q = encodeURIComponent(query).replace(/%20/g, '+');
        const url = `${this.baseUrl}/search/${query}/${page || ''}`;
        const html = await this.fetch(url);
        return this.parseIndex(html);
    }

    override async getDetails(id: string): Promise<Details> {
        // ID is passed as the href path (e.g., /video-123/title)
        const url = `${this.baseUrl}${id}`;
        const html = await this.fetch(url);

        // Extract basic data (not really needed for streams, but compliant)
        return {
            id,
            title: id,
            poster: '',
            headers: {},
            seasons: [],
            suggestedVideo: []
        };
    }

    override async getStreams(id: string): Promise<Stream> {
        const url = `${this.baseUrl}${id}`;
        console.log(`[XNXX] Fetching stream page: ${url}`);
        const html = await this.fetch(url);

        let videoUrl = "";

        // standard regex for XNXX
        const highMatch = html.match(/html5player\.setVideoUrlHigh\('([^']+)'/);
        const lowMatch = html.match(/html5player\.setVideoUrlLow\('([^']+)'/);

        if (highMatch) videoUrl = highMatch[1];
        else if (lowMatch) videoUrl = lowMatch[1];

        console.log(`[XNXX] Stream found: ${videoUrl ? 'YES' : 'NO'}`);

        return {
            url: videoUrl,
            quality: 'auto',
            title: id,
            qualities: [],
            subtitles: []
        };
    }
}
