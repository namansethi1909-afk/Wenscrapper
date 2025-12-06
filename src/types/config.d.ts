export interface config {
  NODE_ENV: "DEV" | "PROD" | "TEST";
  PORT: string;
  REDIS_PORT: string;
  BASE_URL: string;
  PROXY_MANAGER: string;
}
