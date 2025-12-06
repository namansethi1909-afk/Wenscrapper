import type { Stream, Search, Details, Home } from "./index";

export abstract class BaseSource {
  abstract baseUrl: string;
  abstract headers: object;
  abstract getStreams(id: string): Promise<Stream>;
  abstract getSearch(slug: string, page?: string): Promise<Search[]>;
  abstract getHome(page?: string, limit?: string): Promise<Home[]>;
  abstract getDetails(id: string): Promise<Details>;
}
