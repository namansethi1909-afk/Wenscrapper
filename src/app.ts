import express, {
  type NextFunction,
  type Response,
  type Request,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

const app = express();
// files
import type { errorMiddleware } from "./types";
import { ApiError } from "./handler/error.handler";
import { ApiResponse } from "./handler/response.handler";
import { CONFIG } from "./config";
import { hardgifRouter } from "./routes/hardgif.route";
import { fsiblogRouter } from "./routes/fsiblog.route";
// middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ limit: "20kb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(hardgifRouter);
app.use(fsiblogRouter);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  const data = {
    "api-endpoints": {
      "/": `${CONFIG.BASE_URL}/`,
      "trending  /GET": `${CONFIG.BASE_URL}/trending`,
    },
  };
  return ApiResponse.success(
    res,
    "welcome to alpha skymute scrapper",
    200,
    data,
  );
});

app.use(
  (
    err: Error,
    req: Request,
    res: Response<errorMiddleware>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
  ) => {
    if (err instanceof ApiError) {
      return ApiResponse.error(res, err.message, err.statusCode, err.errors);
    }
    return ApiResponse.error(res, "unexpected error occurred", 500, null);
  },
);

export default app;
