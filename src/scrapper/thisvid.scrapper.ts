import * as cheerio from "cheerio";
"Referer": this.baseUrl
                },
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

    // ThisVid usually uses .thumb-block or similar
    // Based on dump, we found links. Let's look for video containers.
    // Common pattern: div.video-block or div.thumb
    // Since I don't have the exact class from dump, I'll target anchors with /videos/

    const videoLinks = $('a[href*="/videos/"]');

    videoLinks.each((_, el) => {
        const $el = $(el);
        // Verify if it's a real video thumb block (has image)
        const img = $el.find('img');
        if (img.length === 0 && !$el.parent().find('img').length) return;

        const href = $el.attr('href') || "";
        if (!href.includes('/videos/')) return;

        // Extract ID from href (slug)
        const idMatch = href.match(/\/videos\/([^\/]+)\/?/);
        const id = idMatch ? idMatch[1] : "";
        if (!id) return;

        const title = $el.attr('title') || img.attr('alt') || $el.text().trim() || "Untitled";
        const poster = img.attr('src') || img.attr('data-src') || "";

        // Avoid duplicates
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

    override async getHome(page ?: string): Promise < Home[] > {
    // Pagination logic: /latest-updates/2/ ?
    // Usually index is just root
    const url = this.baseUrl;
    // Pagination support can be added later if needed (usually /latest-updates/page/2/)

    const html = await this.fetch(url);
    return this.parseIndex(html);
}

    override async getSearch(query: string, page ?: string): Promise < Search[] > {
    // Search URL: https://thisvid.com/search/query/
    // URL encode query
    const q = encodeURIComponent(query).replace(/%20/g, '+');
    const url = `${this.baseUrl}/search/${q}/`;
    const html = await this.fetch(url);
    return this.parseIndex(html);
}

    override async getDetails(id: string): Promise < Details > {
    // Not used by Skymute main flow but good to have
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

    override async getStreams(id: string): Promise < Stream > {
    const url = `${this.baseUrl}/videos/${id}/`;
    const html = await this.fetch(url);

    let videoUrl = "";

    // Regex extract MP4
    const mp4Match = html.match(/file\s*:\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i) ||
        html.match(/source\s*src\s*=\s*["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i) ||
        html.match(/(https?:\/\/[^"']+\.mp4[^"']*)/i);

    if(mp4Match) videoUrl = mp4Match[1];

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
