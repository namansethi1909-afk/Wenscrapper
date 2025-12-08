import { Router } from "express";
import {
    getDetails,
    getHome,
    getSearch,
    getStreams,
} from "../controllers/masa49.controller";

const router = Router();

router.route("/masa49/streams").post(getStreams);
router.route("/masa49/search/:search").get(getSearch);
router.route("/masa49/details").post(getDetails);
router.route("/masa49/trending").get(getHome);

export { router as masa49Router };
