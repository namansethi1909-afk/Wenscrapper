// import axios from "axios";
import axios from "axios";

export async function FetchApi(url: string, useProxy: boolean = false) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching URL:', url, error);
    throw error;
  }
}

// Helper to check env
const getDbUrl = () => process.env.SCRAPPER_DB_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportDataTosScrapperDb = async (videos: any[]) => {
  const dbUrl = getDbUrl();
  if (!dbUrl) return null;
  try {
    const postReq = await axios.post(
      `${dbUrl}/api/extract`,
      {
        videos,
      },
      { headers: { "Content-Type": "application/json" } },
    );
    return postReq.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const scrapperDbWrapper = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any[],
  origin: string,
  page: string,
  provider: string,
  keywords: string[],
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoResponse = response.map((item: any) => ({
    id: item.id,
    videoUrl: null,
    poster: item.poster,
    title: item.title,
    page: page,
    provider,
    keywords,
    origin,
  }));
  await exportDataTosScrapperDb(videoResponse);
};

export const scrapperUrlWrapper = async (
  videoId: string,
  provider: string,
  videoUrl: string,
) => {
  const dbUrl = getDbUrl();
  if (!dbUrl) return null;
  try {
    const postReq = await axios.post(
      `${dbUrl}/api/url`,
      {
        videoId,
        provider,
        videoUrl,
      },
      { headers: { "Content-Type": "application/json" } },
    );
    return postReq.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getExtractedVideos = async (
  origin: string,
  page: string,
  provider: string,
  keywords: string[],
) => {
  const dbUrl = getDbUrl();
  if (!dbUrl) return null;
  try {
    const postReq = await axios.post(
      `${dbUrl}/api/videos`,
      {
        origin,
        page,
        provider,
        keywords,
      },
      { headers: { "Content-Type": "application/json" } },
    );

    return postReq.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getDetailsVideo = async (videoId: string, provider?: string) => {
  const dbUrl = getDbUrl();
  if (!dbUrl) return null;
  try {
    const postReq = await axios.post(
      `${dbUrl}/api/details`,
      {
        videoId,
        provider,
      },
    );

    return postReq.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getStreamsVideo = async (videoId: string, provider: string) => {
  const dbUrl = getDbUrl();
  if (!dbUrl) return null;
  try {
    const postReq = await axios.post(
      `${dbUrl}/api/streams`,
      {
        videoId,
        provider,
      },
    );

    return postReq.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getSearchVideos = async (
  origin: string,
  page: string,
  provider: string,
  keywords: string[],
) => {
  const dbUrl = getDbUrl();
  if (!dbUrl) return null;
  try {
    const videos = await axios.post(
      `${dbUrl}/api/search`,
      {
        origin,
        provider,
        keywords,
        page,
      },
    );

    return videos.data.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
