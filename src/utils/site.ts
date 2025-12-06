import * as cheerio from "cheerio";
import type { Search } from "../types";
import { queries } from "./randomQuery";
import { support } from "./support";

export async function getExtractedData(html: string): Promise<Search[]> {
  //   console.time("Details");

  const $ = cheerio.load(html);
  const results: Search[] = [];

  $(".card.video-card").each((_, el) => {
    const title = $(el).find(".card-header > h6 > a").text().trim() ?? "";
    const href = $(el).find(".card-header > h6 > a").attr("href")?.trim() ?? "";
    const id = href.replace("/gif/", "");
    let poster =
      $(el).find(".mobVideoContainer").attr("data-screenshots") ?? "";

    try {
      // Parse JSON array from attribute
      const screenshots: string[] = JSON.parse(poster);
      poster = screenshots[0] ?? "";
    } catch {
      poster = "";
    }

    if (title && id && poster) {
      results.push({ title, id, poster });
    }
  });
  //   console.timeEnd("Details");
//   console.log(results.length);

  return results;
}

export function randomQuery() {
  const data = queries;
  const random = Math.floor(Math.random() * data.length);
  const res = data[random];
  //   const textToArr = res.split(" ");
  const text = encodeURIComponent(res);

  return text;
}

export const removeSupportingChars = async (text: string) => {
  const stopwords = new Set(support);
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word && !stopwords.has(word));
};
