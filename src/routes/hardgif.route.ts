import { Router } from "express";
import {
  getDetails,
  getHome,
  getSearch,
  getStreams,
} from "../controllers/hardgif.controller";

const router = Router();

router.route("/streams").post(getStreams);
router.route("/search/:search").get(getSearch);
router.route("/details").post(getDetails);
router.route("/trending").get(getHome);

export { router as hardgifRouter };
