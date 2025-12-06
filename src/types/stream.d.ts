import type { SuggestedVideo } from "./media";

export type Stream = {
  url: string;
  title: string;
  quality: string;
  qualities: qualities[];
  subtitles?: Subtitle[];
};

export interface qualities {
  lang: string;
  url: string;
}

export interface Subtitle {
  lang: string;
  url: string;
}

export interface Search {
  id: string;
  poster: string;
  title: string;
}

export interface Home {
  id: string;
  poster: string;
  title: string;
}

export interface Episodes {
  id: string;
  title: string;
}

export interface Seasons {
  title: string;
  poster: string;
  episodes: Episodes[];
}
export interface Details {
  id: string;
  poster: string;
  title: string;
  headers: object;
  seasons: Seasons[];
  suggestions?: SuggestedVideo[];
  SuggestedVideo?: SuggestedVideo[];
  suggestedVideo?: SuggestedVideo[];
}
