import { nanoid } from "nanoid";
import { urls } from "../config/db.js";
import log from "../../middleware/logger.js";

// for short url
export const createShortUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      await log("backend", "error", "handler", "URL not provided in request");
      return res.status(400).json({ message: "URL is required" });
    }

    const code = nanoid(6);

    //for any probelm
    const exists = urls.find((u) => u.code === code);
    if (exists) {
      await log(
        "backend",
        "fatal",
        "controller",
        `Shortcode collision: ${code}`
      );
      return res.status(500).json({ message: "Problem occurred, try again" });
    }

    const expiry = new Date(Date.now() + 30 * 60 * 1000); // default 30 minutes

    const newEntry = {
      url,
      code,
      createdAt: new Date(),
      expiry,
      clicks: [],
    };

    urls.push(newEntry);

    await log("backend", "info", "controller", `Short URL created: ${code}`);

    return res.status(201).json({
      shortlink: `http://localhost:3000/${code}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    await log(
      "backend",
      "fatal",
      "controller",
      `Error creating short URL: ${err.message}`
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

// for redirecting
export const redirectToUrl = async (req, res) => {
  try {
    const { code } = req.params;
    const entry = urls.find((u) => u.code === code);

    if (!entry) {
      await log("backend", "error", "handler", `Shortcode not found: ${code}`);
      return res.status(404).json({ message: "Shortcode not found" });
    }

    if (new Date() > entry.expiry) {
      await log("backend", "warn", "controller", `Shortcode expired: ${code}`);
      return res.status(410).json({ message: "Link expired" });
    }

    // for click track
    entry.clicks.push({
      timestamp: new Date(),
      referrer: req.get("referrer") || "direct",
      ip: req.ip,
    });

    await log(
      "backend",
      "info",
      "controller",
      `Redirected to original URL: ${code}`
    );
    return res.redirect(entry.url);
  } catch (err) {
    await log(
      "backend",
      "fatal",
      "controller",
      `Error redirecting URL: ${err.message}`
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

// for url stats
export const getShortUrlStats = async (req, res) => {
  try {
    const { code } = req.params;
    const entry = urls.find((u) => u.code === code);

    if (!entry) {
      await log(
        "backend",
        "error",
        "controller",
        `Stats requested for missing shortcode: ${code}`
      );
      return res.status(404).json({ message: "Shortcode not found" });
    }

    return res.json({
      originalUrl: entry.url,
      createdAt: entry.createdAt,
      expiry: entry.expiry,
      totalClicks: entry.clicks.length,
      clicks: entry.clicks,
    });
  } catch (err) {
    await log(
      "backend",
      "fatal",
      "controller",
      `Error getting stats: ${err.message}`
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
