import * as cheerio from "cheerio";
import axios from "axios";
import axiosRetry from "axios-retry";
import type { Stream, Search, Details, Home } from "../types";
import { BaseSource } from "../types/baseSource";
import { getAgentRandomRotation } from "../utils/userAgents";

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

// Helpers for tests/offline parsing
export function parseFsiblogIndexHtml(html: string, sourceUrl = "") {
  const scraper = new FsiBlog();
  return (scraper as any).parseIndex(html, sourceUrl);
}

export function parseFsiblogVideoHtml(html: string) {
  const $ = cheerio.load(html);
  const title = ($("h1.title").first().text() || $("title").text() || "").trim();
  const description = (
    $(".video_description").text().trim() ||
    $(".dec").text().trim() ||
    ""
  );
  const tags = $("p.tag_section a.tag-button").map((_: number, a) => $(a).text().trim()).get();
  const uploadIso = $("meta[property='article:published_time']").attr("content") || null;
  const upload_date = uploadIso ? new Date(uploadIso).toISOString().slice(0, 10) : null;
  const uploader = $("meta[name='twitter:data1']").attr("content") || null;
  const sources = $("video#video-id source").map((_: number, s) => {
    const url = $(s).attr("src") || "";
    const q = ($(s).attr("title") || "").trim() || "auto";
    return { quality: q, url };
  }).get();
  const video_url = sources.length ? sources[0].url : (
    $("form[action$='.mp4']").attr("action") || ""
  );
  let video_id: string = "";
  const idFromMp4 = video_url.match(/\b(?:id\/)(\d+)\.mp4\b/);
  const idFromEmbed = ($(".downLink button[onclick]").attr("onclick") || "").match(/id=(\d+)/);
  if (idFromMp4 && idFromMp4[1]) video_id = idFromMp4[1];
  else if (idFromEmbed && idFromEmbed[1]) video_id = idFromEmbed[1];

  const poster = $("meta[property='og:image']").attr("content") || null;
  return { video_id, title, description, uploader, upload_date, tags, poster, video_url, sources };
}

export class FsiBlog extends BaseSource {
  override baseUrl = "https://www.fsiblog.cc";
  override headers = {
    "User-Agent": getAgentRandomRotation(),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": `${this.baseUrl}/`,
    "Connection": "keep-alive",
  };

  private async fetch(url: string, delayMs = 0) {
    if (delayMs > 0) await sleep(delayMs);
    const res = await axios.get<string>(url, { headers: this.headers, timeout: 20000 });
    return res.data;
  }

  private parseIndex(html: string, sourceUrl: string): Search[] {
    const $ = cheerio.load(html);
    const results: Search[] = [];
    // Prefer the main list inside #ajax_content; fallback to any .posts .video_list
    const items = $("#ajax_content ul.video_list li.video");
    const scope = items.length ? items : $(".posts ul.video_list li.video");
    scope.each((_: number, el) => {
      const $el = $(el);
      const aTitle = $el.find("a.title");
      const href = aTitle.attr("href") || $el.find("a.thumb").attr("href") || "";
      const title = (aTitle.text() || $el.find("a.thumb").attr("title") || "").trim();
      const thumb = $el.find("a.thumb img").attr("src") || null;
      const durationText = $el.find("span.video-duration").text().trim();
      const duration = durationText ? this.parseDuration(durationText) : null;

      if (href) {
        // Use slug as id (last path component without trailing slash)
        const id = href.replace(/\/$/, "").split("/").filter(Boolean).pop() || href;
        results.push({
          id,
          title,
          poster: thumb || "",
          page: href,  // Use actual video page URL, not search URL
          provider: this.baseUrl,
          keywords: [],
          origin: "search",
          durationSeconds: duration,
        } as unknown as Search);
      }
    });
    return results;
  }

  private parseDuration(text: string): number | null {
    // Formats like 01:26 or 11:03
    const m = text.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const mm = parseInt(m[1], 10);
    const ss = parseInt(m[2], 10);
    return mm * 60 + ss;
  }

  override async getHome(page = "1", limit?: string): Promise<Home[]> {
    const url = page === "1" ? `${this.baseUrl}/` : `${this.baseUrl}/page/${page}/`;
    const html = await this.fetch(url);
    const data = this.parseIndex(html, url);
    // Return full data including page URLs for video playback
    return data as unknown as Home[];
  }

  override async getSearch(slug: string, page = "1"): Promise<Search[]> {
    const url = `${this.baseUrl}/?s=${encodeURIComponent(slug)}${page && page !== "1" ? `&paged=${page}` : ""}`;
    const html = await this.fetch(url);
    return this.parseIndex(html, url);
  }

  override async getDetails(id: string): Promise<Details> {
    // id is slug like "sexy-desi-girl-shows-big-boobs-and-pussy"
    const pageUrl = id.startsWith("http") ? id : `${this.baseUrl}/${id.replace(/^\/+|\/+$/g, "")}/`;
    const html = await this.fetch(pageUrl);
    const $ = cheerio.load(html);

    // Title
    const title = ($("h1.title").first().text() || $("title").text() || "").trim();
    // Description
    const description = (
      $(".video_description").text().trim() ||
      $(".dec").text().trim() ||
      ""
    );

    // Tags and categories
    const tags = $("p.tag_section a.tag-button").map((_: number, a) => $(a).text().trim()).get();

    // Upload date
    const uploadIso = $("meta[property='article:published_time']").attr("content") || null;
    const upload_date = uploadIso ? new Date(uploadIso).toISOString().slice(0, 10) : null;

    // Uploader
    const uploader = $("meta[name='twitter:data1']").attr("content") || null;

    // Video sources (<video id="video-id"><source ... title="360p" type="video/mp4">)
    const sources = $("video#video-id source").map((_: number, s) => {
      const url = $(s).attr("src") || "";
      const quality = ($(s).attr("title") || "").trim() || "auto";
      // project types expect {lang,url}; store quality label in lang
      return { lang: quality, url };
    }).get();

    // Primary video url
    const video_url = sources.length ? sources[0].url : (
      $("form[action$='.mp4']").attr("action") || ""
    );

    // Derive numeric video id if present (e.g., /id/62478.mp4 or ?id=62478)
    let video_id: string = id;
    const idFromMp4 = video_url.match(/\b(?:id\/)(\d+)\.mp4\b/);
    const idFromEmbed = ($(".downLink button[onclick]").attr("onclick") || "").match(/id=(\d+)/);
    if (idFromMp4 && idFromMp4[1]) video_id = idFromMp4[1];
    else if (idFromEmbed && idFromEmbed[1]) video_id = idFromEmbed[1];

    // Poster/thumbnail: try poster meta; fallback null
    const poster = $("meta[property='og:image']").attr("content") || null;

    // Build Details in existing project shape
    const randomPageNumber = Math.floor(Math.random() * 10) + 1;
    const suggestions = await this.getSearch("desi", String(randomPageNumber));

    const details = {
      id: video_id,
      headers: this.headers,
      poster: poster ?? "",
      title,
      description,
      uploader,
      upload_date,
      tags,
      suggestedVideo: suggestions,
      seasons: [
        {
          title: "video",
          poster: poster ?? "",
          episodes: [{ id: video_id, title }],
        },
      ],
    } as unknown as Details;

    // Persist primary stream in url wrapper (compatible with existing design) is handled in getStreams
    return details;
  }

  override async getStreams(id: string): Promise<Stream> {
    // id may be slug or numeric; if numeric, we can try the embed/download patterns too, but simplest is
    // to fetch the page by slug and read <video> sources.
    const pageUrl = /^(https?:)?\//.test(id)
      ? id
      : (/(^\d+$)/.test(id)
        ? `${this.baseUrl}/?p=${id}` // unlikely, but fallback
        : `${this.baseUrl}/${id.replace(/^\/+|\/+$/g, "")}/`);
    const html = await this.fetch(pageUrl);
    const $ = cheerio.load(html);

    const title = ($("h1.title").first().text() || $("title").text() || "").trim();
    const sources = $("video#video-id source").map((_: number, s) => {
      const url = $(s).attr("src") || "";
      const q = ($(s).attr("title") || "").trim() || "auto";
      return { lang: q, url };
    }).get();

    const primary = sources[0] || { lang: "auto", url: "" };

    return {
      url: primary.url,
      quality: primary.lang,
      title,
      qualities: sources,
      subtitles: [],
    };
  }
}
