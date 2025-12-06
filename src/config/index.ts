import { type config } from "../types";
import { configSchema } from "./schema";

const parsedData = configSchema.safeParse(process.env);
if (!parsedData.success) {
  console.error(
    "invalid env variables",
    parsedData.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const CONFIG: config = parsedData.data;
