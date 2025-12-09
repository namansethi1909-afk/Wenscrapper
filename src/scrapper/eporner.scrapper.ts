import axios from 'axios';
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";

export class Eporner extends BaseSource {
    override baseUrl = "https://www.eporner.com";
    override headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };

    private async fetch(url: string): Promise<any> {
        try {
            const { data } = await axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });
            return data;
        } catch (error: any) {
            console.error(`[Eporner] Fetch error for ${url}:`, error.message);
            return null;
        }
    }

    private format(item: any): Search {
        // Search interface only has id, title, poster
        // The URL/page is not stored in Search object according to types/stream.d.ts
        return {
            id: item.id,
            title: item.title,
            poster: item.default_thumb ? item.default_thumb.src : ''
        };
    }

    override async getHome(page?: string): Promise<Home[]> {
        // Eporner specific home query
        const url = `https://www.eporner.com/api/v2/video/search/?query=teen&per_page=30&page=${page || 1}&thumbsize=medium&order=top-weekly`;
        const data = await this.fetch(url);
        if (data && data.videos) {
            return data.videos.map((v: any) => ({
                id: v.id,
                title: v.title,
                poster: v.default_thumb ? v.default_thumb.src : ''
            }));
        }
        return [];
    }

    override async getSearch(query: string, page?: string): Promise<Search[]> {
        const q = encodeURIComponent(query);
        const url = `https://www.eporner.com/api/v2/video/search/?query=${q}&per_page=30&page=${page || 1}&thumbsize=medium&order=most-popular`;
        const data = await this.fetch(url);
        if (data && data.videos) {
            return data.videos.map(this.format);
        }
        return [];
    }

    override async getDetails(id: string): Promise<Details> {
        // API for details: /api/v2/video/id/
        const url = `https://www.eporner.com/api/v2/video/id/?id=${id}`;
        const data = await this.fetch(url);

        if (!data) {
            return {
                id,
                title: id,
                poster: '',
                headers: {},
                seasons: [],
                suggestedVideo: []
            };
        }

        return {
            id: data.id,
            title: data.title,
            poster: data.default_thumb ? data.default_thumb.src : '',
            headers: {},
            seasons: [],
            suggestedVideo: []
        };
    }

    override async getStreams(id: string): Promise<Stream> {
        const pageUrl = `https://www.eporner.com/video-${id}/_`;
        console.log(`[Eporner] Fetching stream page: ${pageUrl}`);

        try {
            const { data: html } = await axios.get(pageUrl, {
                headers: this.headers,
                timeout: 10000
            });

            let videoUrl = "";

            const match720 = html.match(/1080p[^"]+src":"([^"]+)/) || html.match(/720p[^"]+src":"([^"]+)/) || html.match(/480p[^"]+src":"([^"]+)/);
            if (match720) {
                videoUrl = match720[1].replace(/\\/g, '');
            } else {
                const generic = html.match(/src":"(https:[^"]+\.mp4[^"]*)"/);
                if (generic) videoUrl = generic[1].replace(/\\/g, '');
            }

            console.log(`[Eporner] Stream found: ${videoUrl ? 'YES' : 'NO'}`);

            return {
                url: videoUrl,
                quality: 'auto',
                title: id,
                qualities: [], // assuming empty array matches qualties[] type
                subtitles: []
            };
        } catch (e) {
            console.error('[Eporner] Stream fetch error:', e);
            return { url: '', quality: 'auto', title: id, qualities: [] };
        }
    }
}
