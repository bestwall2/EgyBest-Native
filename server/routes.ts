import type { Express } from "express";
import { createServer, type Server } from "node:http";
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
  timeout: 15000,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Proxy with language support via query param
  const handleProxiedRequest = async (
    req: any,
    res: any,
    path: string,
    additionalParams = {},
  ) => {
    try {
      const language = req.query.language || "en-US";
      const response = await tmdbApi.get(path, {
        params: { ...req.query, ...additionalParams, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error(`TMDB API error (${path}):`, error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  };

  // Trending
  app.get("/api/tmdb/trending/:mediaType/:timeWindow", async (req, res) => {
    const { mediaType, timeWindow } = req.params;
    await handleProxiedRequest(req, res, `/trending/${mediaType}/${timeWindow}`);
  });

  // Movie endpoints
  app.get("/api/tmdb/movie/popular", async (req, res) => {
    await handleProxiedRequest(req, res, "/movie/popular");
  });

  app.get("/api/tmdb/movie/top_rated", async (req, res) => {
    await handleProxiedRequest(req, res, "/movie/top_rated");
  });

  app.get("/api/tmdb/movie/upcoming", async (req, res) => {
    await handleProxiedRequest(req, res, "/movie/upcoming");
  });

  app.get("/api/tmdb/movie/now_playing", async (req, res) => {
    await handleProxiedRequest(req, res, "/movie/now_playing");
  });

  app.get("/api/tmdb/movie/:id", async (req, res) => {
    const { id } = req.params;
    await handleProxiedRequest(req, res, `/movie/${id}`);
  });

  // TV Show endpoints
  app.get("/api/tmdb/tv/popular", async (req, res) => {
    await handleProxiedRequest(req, res, "/tv/popular");
  });

  app.get("/api/tmdb/tv/top_rated", async (req, res) => {
    await handleProxiedRequest(req, res, "/tv/top_rated");
  });

  app.get("/api/tmdb/tv/on_the_air", async (req, res) => {
    await handleProxiedRequest(req, res, "/tv/on_the_air");
  });

  app.get("/api/tmdb/tv/:id", async (req, res) => {
    const { id } = req.params;
    await handleProxiedRequest(req, res, `/tv/${id}`);
  });

  app.get("/api/tmdb/tv/:id/season/:seasonNumber", async (req, res) => {
    const { id, seasonNumber } = req.params;
    await handleProxiedRequest(req, res, `/tv/${id}/season/${seasonNumber}`);
  });

  // Discover endpoints
  app.get("/api/tmdb/discover/movie", async (req, res) => {
    await handleProxiedRequest(req, res, "/discover/movie");
  });

  app.get("/api/tmdb/discover/tv", async (req, res) => {
    await handleProxiedRequest(req, res, "/discover/tv");
  });

  // Genre endpoints
  app.get("/api/tmdb/genre/movie/list", async (req, res) => {
    await handleProxiedRequest(req, res, "/genre/movie/list");
  });

  app.get("/api/tmdb/genre/tv/list", async (req, res) => {
    await handleProxiedRequest(req, res, "/genre/tv/list");
  });

  // Search endpoints
  app.get("/api/tmdb/search/movie", async (req, res) => {
    if (!req.query.query) {
      return res.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    await handleProxiedRequest(req, res, "/search/movie");
  });

  app.get("/api/tmdb/search/tv", async (req, res) => {
    if (!req.query.query) {
      return res.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    await handleProxiedRequest(req, res, "/search/tv");
  });

  app.get("/api/tmdb/search/multi", async (req, res) => {
    if (!req.query.query) {
      return res.json({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    await handleProxiedRequest(req, res, "/search/multi");
  });

  // Person endpoints
  app.get("/api/tmdb/person/:id", async (req, res) => {
    const { id } = req.params;
    await handleProxiedRequest(req, res, `/person/${id}`);
  });

  // Images endpoints (for logos)
  app.get("/api/tmdb/movie/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await tmdbApi.get(`/movie/${id}/images`);
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/tv/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await tmdbApi.get(`/tv/${id}/images`);
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Catch-all for /api routes to always return JSON (fixes Unexpected character at line 1 column 1)
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `Not Found: ${req.method} ${req.path}` });
  });

  const httpServer = createServer(app);
  return httpServer;
}
