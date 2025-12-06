import redis from "ioredis";
import { CONFIG } from "./index";

export const client = new redis({
  host: "127.0.0.1",
  port: Number(CONFIG.REDIS_PORT),
});
