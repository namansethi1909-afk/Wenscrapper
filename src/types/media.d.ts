type MediaType = "video";

export interface Content {
  id: string;
  title: string;
}

export interface Media {
  id: string;
  title: string;
  poster: string;
  content?: Content;
  type: MediaType;
}

export interface SearchResult {
  id: string;
  title: string;
  poster: string;
}

export interface SuggestedVideo {
  id: string;
  poster: string;
  title: string;
}
