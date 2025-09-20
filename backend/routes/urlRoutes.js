import express from "express";
import {
  createShortUrl,
  getShortUrlStats,
  redirectToUrl,
} from "../controller/urlController.js";

const router = express.Router();

router.post("/shorturls", createShortUrl);
router.get("/shorturls/:code", getShortUrlStats);
router.get("/:code", redirectToUrl);

export default router;
