import axios from "axios";
import fs from "fs";
import path from "path";

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

type Listing = { id: string; poster: string; title: string };

type Details = {
  id: string;
  poster: string;
  title: string;
  headers: object;
  seasons: Array<{ title: string; poster: string; episodes: Array<{ id: string; title: string }> }>;
  [k: string]: unknown;
};

type Stream = { url: string; title: string; quality: string; qualities: Array<{ lang: string; url: string }> };

function parseArg(name: string, def: string): string {
  const idx = process.argv.findIndex(a => a === `--${name}`);
  if (idx !== -1 && idx + 1 < process.argv.length) return String(process.argv[idx + 1]);
  return String(def);
}

async function getTrending(base: string, page: number): Promise<Listing[]> {
  const url = `${base}/fsiblog/trending?page=${page}`;
  const { data } = await axios.get(url, { timeout: 30000 });
  if (Array.isArray(data)) return data as Listing[];
  return [];
}

async function getDetails(base: string, id: string): Promise<Details | null> {
  try {
    const { data } = await axios.post(`${base}/fsiblog/details`, { id }, { timeout: 30000 });
    return data as Details;
  } catch {
    return null;
  }
}

async function getStreams(base: string, id: string): Promise<Stream | null> {
  try {
    const { data } = await axios.post(`${base}/fsiblog/streams`, { id }, { timeout: 30000 });
    if (Array.isArray(data) && data[0]) return data[0] as Stream;
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const base: string = parseArg("base", "http://localhost:3000");
  const startPage: number = parseInt(parseArg("start-page", "1"), 10);
  const maxEmpty: number = parseInt(parseArg("max-empty", "3"), 10);
  const delayMs: number = parseInt(parseArg("delay", "500"), 10);
  const concurrency: number = parseInt(parseArg("concurrency", "4"), 10);
  const outPrefix: string = parseArg("out", path.join("workdir", "fsiblog_all"));
  const maxPages: number = parseInt(parseArg("max-pages", "1000"), 10);
  const fromListings: string | null = (() => {
    const idx = process.argv.findIndex(a => a === "--from-listings");
    if (idx !== -1 && idx + 1 < process.argv.length) return String(process.argv[idx + 1]);
    return null;
  })();

  fs.mkdirSync(path.dirname(outPrefix), { recursive: true });
  const outJsonl = `${outPrefix}.jsonl`;
  const outJson = `${outPrefix}.json`;
  const tmpListings = `${outPrefix}_listings.json`;

  const writeStream = fs.createWriteStream(outJsonl, { flags: "w" });
  const all: any[] = [];

  const ids = new Set<string>();
  if (fromListings) {
    console.log(`[enrich] loading ids from ${fromListings}`);
    const raw = fs.readFileSync(fromListings, "utf8");
    const arr: unknown = JSON.parse(raw);
    if (Array.isArray(arr)) arr.forEach(v => typeof v === "string" && ids.add(v));
    console.log(`[enrich] loaded ${ids.size} ids`);
    fs.writeFileSync(tmpListings, JSON.stringify(Array.from(ids), null, 2));
  } else {
    let emptyStreak = 0;
    console.log(`[crawl] start at page ${startPage}`);
    for (let p = startPage; p < startPage + maxPages; p++) {
      try {
        const list = await getTrending(base, p);
        if (!list.length) {
          emptyStreak++;
          console.log(`[crawl] page ${p} empty (${emptyStreak}/${maxEmpty})`);
          if (emptyStreak >= maxEmpty) {
            console.log(`[crawl] stopping after ${emptyStreak} consecutive empty pages`);
            break;
          }
          continue;
        }
        emptyStreak = 0;
        for (const item of list) ids.add(item.id);
        fs.writeFileSync(tmpListings, JSON.stringify(Array.from(ids), null, 2));
        console.log(`[crawl] page ${p} got ${list.length}, total unique ids: ${ids.size}`);
      } catch (e) {
        // treat request errors as empty to advance the stop condition
        emptyStreak++;
        console.log(`[crawl] page ${p} error (${emptyStreak}/${maxEmpty}): ${(e as Error).message}`);
        if (emptyStreak >= maxEmpty) {
          console.log(`[crawl] stopping after ${emptyStreak} consecutive empty/error pages`);
          break;
        }
      }
      if (delayMs) await sleep(delayMs);
    }
  }

  // Process details/streams with simple concurrency
  const queue = Array.from(ids);
  let idx = 0;
  async function worker(wid: number) {
    while (true) {
      const i = idx++;
      if (i >= queue.length) break;
      const id = queue[i];
      try {
        const [details, streams] = await Promise.all([
          getDetails(base, id),
          getStreams(base, id),
        ]);
        const record = {
          video_id: details?.id ?? id,
          title: details?.title ?? "",
          description: (details as any)?.description ?? "",
          uploader: (details as any)?.uploader ?? null,
          upload_date: (details as any)?.upload_date ?? null,
          duration_seconds: null,
          thumbnail: details?.poster ?? null,
          video_url: streams?.url ?? null,
          tags: (details as any)?.tags ?? [],
          video_sources: (streams?.qualities || []).map(q => ({ quality: q.lang, url: q.url })),
          source_page: `https://www.fsiblog.cc/${id}/`,
          scraped_at: new Date().toISOString(),
        };
        writeStream.write(JSON.stringify(record) + "\n");
        all.push(record);
        if (delayMs) await sleep(delayMs);
      } catch (e) {
        console.log(`[worker ${wid}] error id=${id}: ${(e as Error).message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, (_, k) => worker(k + 1));
  await Promise.all(workers);
  writeStream.end();

  fs.writeFileSync(outJson, JSON.stringify(all, null, 2));
  console.log(`[done] wrote ${all.length} records to`);
  console.log(` - ${outJsonl}`);
  console.log(` - ${outJson}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
