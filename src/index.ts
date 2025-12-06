import app from "./app";
import { CONFIG } from "./config/index";
// import { client } from "./src/config/redis.ts";
import { isDev } from "./lib/constants";
import logger from "./lib/logger";
const PORT: string = CONFIG.PORT;

// client.connect((res) => console.log(res?.message));
(() => {
  if (isDev) console.time("server");

  app.listen(PORT, () => {
    switch (CONFIG.NODE_ENV) {
      case "DEV":
        logger.info(
          `server is listening on MODE:${CONFIG.NODE_ENV} at http://localhost:${PORT}`,
        );
        break;

      case "TEST":
        logger.info(
          `server is listening on MODE : ${CONFIG.NODE_ENV} at http://localhost:${PORT}`,
        );
        break;

      case "PROD":
        logger.info(`server is listening on MODE: ${CONFIG.NODE_ENV}`);
        break;

      default:
        console.log(`unknown mode`);
        break;
    }
  });

  if (isDev) console.timeEnd("server");
})();
