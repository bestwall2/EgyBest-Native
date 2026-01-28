import type { Express } from "express";
import { createServer, type Server } from "node:http";
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "90a823390bd37b5c1ba175bef7e2d5a8";

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 15000,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Common middleware to handle language if provided in path
  app.use("/api/tmdb/:lang", (req, _res, next) => {
    // If language is in path, move it to query for the actual handlers
    const lang = (req.params as any).lang;
    if (lang && lang.length === 2) {
      req.query.language = lang;
    }
    next();
  });

  // Proxy with language support
  const handleProxiedRequest = async (
    req: any,
    res: any,
    path: string,
    additionalParams = {},
  ) => {
    try {
      const language = req.query.language || req.params.lang || "en-US";
      const response = await tmdbApi.get(path, {
        params: { ...req.query, ...additionalParams, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error(`TMDB API error (${path}):`, error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  };

  // Trending (including "all" for mixed content)
  app.get(
    [
      "/api/tmdb/trending/:mediaType/:timeWindow",
      "/api/tmdb/:lang/trending/:mediaType/:timeWindow",
    ],
    async (req, res) => {
      const { mediaType, timeWindow } = req.params;
      await handleProxiedRequest(
        req,
        res,
        `/trending/${mediaType}/${timeWindow}`,
      );
    },
  );

  // Movie endpoints
  app.get(
    ["/api/tmdb/movie/popular", "/api/tmdb/:lang/movie/popular"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/movie/popular");
    },
  );

  app.get(
    ["/api/tmdb/movie/top_rated", "/api/tmdb/:lang/movie/top_rated"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/movie/top_rated");
    },
  );

  app.get(
    ["/api/tmdb/movie/upcoming", "/api/tmdb/:lang/movie/upcoming"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/movie/upcoming");
    },
  );

  app.get(
    ["/api/tmdb/movie/now_playing", "/api/tmdb/:lang/movie/now_playing"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/movie/now_playing");
    },
  );

  app.get(
    ["/api/tmdb/movie/:id", "/api/tmdb/:lang/movie/:id"],
    async (req, res) => {
      const { id } = req.params;
      await handleProxiedRequest(req, res, `/movie/${id}`);
    },
  );

  // TV Show endpoints
  app.get(
    ["/api/tmdb/tv/popular", "/api/tmdb/:lang/tv/popular"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/tv/popular");
    },
  );

  app.get(
    ["/api/tmdb/tv/top_rated", "/api/tmdb/:lang/tv/top_rated"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/tv/top_rated");
    },
  );

  app.get(
    ["/api/tmdb/tv/on_the_air", "/api/tmdb/:lang/tv/on_the_air"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/tv/on_the_air");
    },
  );

  app.get(["/api/tmdb/tv/:id", "/api/tmdb/:lang/tv/:id"], async (req, res) => {
    const { id } = req.params;
    await handleProxiedRequest(req, res, `/tv/${id}`);
  });

  app.get(
    [
      "/api/tmdb/tv/:id/season/:seasonNumber",
      "/api/tmdb/:lang/tv/:id/season/:seasonNumber",
    ],
    async (req, res) => {
      const { id, seasonNumber } = req.params;
      await handleProxiedRequest(req, res, `/tv/${id}/season/${seasonNumber}`);
    },
  );

  // Discover endpoints
  app.get(
    ["/api/tmdb/discover/movie", "/api/tmdb/:lang/discover/movie"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/discover/movie");
    },
  );

  app.get(
    ["/api/tmdb/discover/tv", "/api/tmdb/:lang/discover/tv"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/discover/tv");
    },
  );

  // Genre endpoints
  app.get(
    ["/api/tmdb/genre/movie/list", "/api/tmdb/:lang/genre/movie/list"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/genre/movie/list");
    },
  );

  app.get(
    ["/api/tmdb/genre/tv/list", "/api/tmdb/:lang/genre/tv/list"],
    async (req, res) => {
      await handleProxiedRequest(req, res, "/genre/tv/list");
    },
  );

  // Search endpoints
  app.get(
    ["/api/tmdb/search/movie", "/api/tmdb/:lang/search/movie"],
    async (req, res) => {
      if (!req.query.query) {
        return res.json({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        });
      }
      await handleProxiedRequest(req, res, "/search/movie");
    },
  );

  app.get(
    ["/api/tmdb/search/tv", "/api/tmdb/:lang/search/tv"],
    async (req, res) => {
      if (!req.query.query) {
        return res.json({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        });
      }
      await handleProxiedRequest(req, res, "/search/tv");
    },
  );

  app.get(
    ["/api/tmdb/search/multi", "/api/tmdb/:lang/search/multi"],
    async (req, res) => {
      if (!req.query.query) {
        return res.json({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        });
      }
      await handleProxiedRequest(req, res, "/search/multi");
    },
  );

  // Person endpoints
  app.get(
    ["/api/tmdb/person/:id", "/api/tmdb/:lang/person/:id"],
    async (req, res) => {
      const { id } = req.params;
      await handleProxiedRequest(req, res, `/person/${id}`);
    },
  );

  // Images endpoints (for logos)
  app.get(
    ["/api/tmdb/movie/:id/images", "/api/tmdb/:lang/movie/:id/images"],
    async (req, res) => {
      try {
        const { id } = req.params;
        const response = await tmdbApi.get(`/movie/${id}/images`);
        res.json(response.data);
      } catch (error: any) {
        console.error("TMDB API error:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
      }
    },
  );

  app.get(
    ["/api/tmdb/tv/:id/images", "/api/tmdb/:lang/tv/:id/images"],
    async (req, res) => {
      try {
        const { id } = req.params;
        const response = await tmdbApi.get(`/tv/${id}/images`);
        res.json(response.data);
      } catch (error: any) {
        console.error("TMDB API error:", error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
      }
    },
  );

  // Proxy for TMDB images to avoid CORS issues
  app.get("/api/tmdb/image/:size/:file", async (req, res) => {
    try {
      const imagePath = `${req.params.size}/${req.params.file}`;
      const imageUrl = `https://image.tmdb.org/t/p/${imagePath}`;
      const response = await axios.get(imageUrl, {
        responseType: "stream",
        timeout: 10000,
      });
      if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
      }
      res.setHeader("Cache-Control", "public, max-age=31536000");
      response.data.pipe(res);
    } catch (_error: any) {
      res.status(404).send("Image not found");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
