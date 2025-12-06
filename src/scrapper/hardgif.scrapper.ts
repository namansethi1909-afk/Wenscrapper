import type { Details, Home, Search, Stream } from "../types";
import { BaseSource } from "../types/baseSource";
import * as cheerio from "cheerio";
import { getAgentRandomRotation } from "../utils/userAgents";
import { getExtractedData, randomQuery } from "../utils/site";

import {
  FetchApi,
  getDetailsVideo,
  getExtractedVideos,
  getSearchVideos,
  getStreamsVideo,
  scrapperDbWrapper,
  scrapperUrlWrapper,
} from "../utils/fetchApi";
// import { NotFoundError } from "../handler/error.handler";
const fetchBackendResponse = async function (
  page: string,
  period: string,
  searchString: string,
) {
  const url = `https://hardgif.com/backend.php?&p=${page}&device=mobile&r=&sort=&period=&content=all&viewport=556&sourced=0&search=${searchString}&post=&source=`;

  const data = await FetchApi(url);
  //   console.log(data.text());
  // const response = data.text();
  const response = typeof data === 'string' ? data : JSON.stringify(data);
  return response;
};

export class HardGif extends BaseSource {
  override baseUrl = "https://hardgif.com";
  override headers = {
    Origin: this.baseUrl,
    Referer: `${this.baseUrl}/`,
    "User-Agent": getAgentRandomRotation(),
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
  };

  override async getStreams(id: string): Promise<Stream> {
    const [videoResponse, data] = await Promise.all([
      getStreamsVideo(id, this.baseUrl),
      FetchApi(`${this.baseUrl}/embedPlayer.php?post_id=${id}`, true),
    ]);

    if (videoResponse?.url) return videoResponse;
    // const html = await data.text();
    const html = typeof data === 'string' ? data : JSON.stringify(data);

    const sourcesMatch = html.match(/var sources_json = (\[.*?\]);/s);
    const title =
      /<title>(.*?)<\/title>/i.exec(html)?.[1]?.trim() ?? "unknown title";

    let m3u8Link;
    if (sourcesMatch) {
      const sourcesJson = JSON.parse(sourcesMatch[1]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      m3u8Link = sourcesJson.map((src: any) => src.src);
    }

    if (m3u8Link[0]) {
      scrapperUrlWrapper(id, this.baseUrl, m3u8Link[0]).catch((err) =>
        console.log(err),
      );
    }

    return {
      url: m3u8Link[0] ?? "",
      quality: "auto",
      title,
      qualities: [],
      subtitles: [],
    };
  }

  override async getSearch(slug: string, page?: string): Promise<Search[]> {
    if (!page) {
      page = "1";
    }
    const searchString = encodeURIComponent(slug);
    const decodedKeywords = decodeURIComponent(searchString).split(" ");
    const data = await getSearchVideos(
      "search",
      page,
      this.baseUrl.trim(),
      decodedKeywords,
    );
    if (data && data.length > 0) {
      return data;
    }

    const period = "3";
    const html = await fetchBackendResponse(page, period, searchString);
    const response = await getExtractedData(html);
    scrapperDbWrapper(
      response,
      "search",
      page,
      this.baseUrl.trim(),
      decodedKeywords,
    ).catch((err) =>
      console.log(
        `db save failed scrapperDbWrapper : ${err instanceof Error ? err.message : ""}`,
      ),
    );

    return response;
  }

  //   https://hardgif.com/embedPlayer.php?post_id=292335448
  override async getDetails(id: string): Promise<Details> {
    let video = await getDetailsVideo(id, this.baseUrl.trim());
    if (!video) {
      const data = await FetchApi(
        `${this.baseUrl}/embedPlayer.php?post_id=${id}`,
      );
      // const html = await data.text();
      const html = typeof data === 'string' ? data : JSON.stringify(data);
      const $ = cheerio.load(html);
      const poster = $("video-js").attr("poster")?.trim();
      const title = $("title").text()?.trim();

      const randomPageNumber = Math.floor(Math.random() * 10);
      const suggestions = await this.getSearch(
        randomQuery(),
        randomPageNumber.toString(),
      );

      video = {
        id,
        headers: this.headers,
        poster: poster ?? "",
        title: title ?? "",
        // suggestions: this.getSearch(randomQuery()),
        // SuggestedVideo: this.getSearch(
        //   randomQuery(),
        //   randomPageNumber.toString(),
        // ),
        suggestedVideo: suggestions,
        seasons: [
          {
            title: "video",
            poster: poster ?? "",
            episodes: [{ id, title: title ?? "" }],
          },
        ],
      };
    }

    return video;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override async getHome(page: string, limit?: string): Promise<Home[]> {
    if (!page) page = "1";
    const searchString = randomQuery();
    const period = "3";
    const decodedKeywords = decodeURIComponent(searchString).split(" ");

    const data = await getExtractedVideos(
      "trending",
      page,
      this.baseUrl,
      decodedKeywords,
    );

    if (data && data.data && data.data.length) {
      return data.data;
    }

    const html = await fetchBackendResponse(page, period, searchString);
    const response = await getExtractedData(html);
    scrapperDbWrapper(
      response,
      "trending",
      page,
      this.baseUrl,
      decodedKeywords,
    ).catch((err: unknown) =>
      console.log(
        `db failed to save ${err instanceof Error ? err.message : "scrapperDbWrapper"}`,
      ),
    );
    return response;
  }
}
