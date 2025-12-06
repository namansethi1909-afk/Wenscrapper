import { Router } from "express";
import { fsiblogDetails, fsiblogHome, fsiblogSearch, fsiblogStreams } from "../controllers/fsiblog.controller";

const router = Router();

router.get("/fsiblog/trending", fsiblogHome);
router.get("/fsiblog/search", fsiblogSearch); // ?q=term&page=1
router.post("/fsiblog/details", fsiblogDetails);
router.post("/fsiblog/streams", fsiblogStreams);

export { router as fsiblogRouter };
