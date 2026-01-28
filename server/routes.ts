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
  // Trending (including "all" for mixed content)
  app.get("/api/tmdb/trending/:mediaType/:timeWindow", async (req, res) => {
    try {
      const { mediaType, timeWindow } = req.params;
      const { language = "en-US" } = req.query;
      const response = await tmdbApi.get(
        `/trending/${mediaType}/${timeWindow}`,
        {
          params: { language },
        },
      );
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Movie endpoints
  app.get("/api/tmdb/movie/popular", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/movie/popular", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/movie/top_rated", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/movie/top_rated", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/movie/upcoming", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/movie/upcoming", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/movie/now_playing", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/movie/now_playing", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/movie/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { append_to_response, language = "en-US" } = req.query;
      const response = await tmdbApi.get(`/movie/${id}`, {
        params: { append_to_response, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // TV Show endpoints
  app.get("/api/tmdb/tv/popular", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/tv/popular", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/tv/top_rated", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/tv/top_rated", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/tv/on_the_air", async (req, res) => {
    try {
      const { page = 1, language = "en-US" } = req.query;
      const response = await tmdbApi.get("/tv/on_the_air", {
        params: { page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/tv/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { append_to_response, language = "en-US" } = req.query;
      const response = await tmdbApi.get(`/tv/${id}`, {
        params: { append_to_response, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/tv/:id/season/:seasonNumber", async (req, res) => {
    try {
      const { id, seasonNumber } = req.params;
      const { language = "en-US" } = req.query;
      const response = await tmdbApi.get(`/tv/${id}/season/${seasonNumber}`, {
        params: { language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Discover endpoints
  app.get("/api/tmdb/discover/movie", async (req, res) => {
    try {
      const {
        page = 1,
        with_genres,
        sort_by = "popularity.desc",
        language = "en-US",
      } = req.query;
      const response = await tmdbApi.get("/discover/movie", {
        params: { page, with_genres, sort_by, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/discover/tv", async (req, res) => {
    try {
      const {
        page = 1,
        with_genres,
        sort_by = "popularity.desc",
        language = "en-US",
      } = req.query;
      const response = await tmdbApi.get("/discover/tv", {
        params: { page, with_genres, sort_by, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Genre endpoints
  app.get("/api/tmdb/genre/movie/list", async (req, res) => {
    try {
      const { language = "en-US" } = req.query;
      const response = await tmdbApi.get("/genre/movie/list", {
        params: { language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/genre/tv/list", async (req, res) => {
    try {
      const { language = "en-US" } = req.query;
      const response = await tmdbApi.get("/genre/tv/list", {
        params: { language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Search endpoints
  app.get("/api/tmdb/search/movie", async (req, res) => {
    try {
      const { query, page = 1, language = "en-US" } = req.query;
      if (!query) {
        return res.json({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        });
      }
      const response = await tmdbApi.get("/search/movie", {
        params: { query, page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/search/tv", async (req, res) => {
    try {
      const { query, page = 1, language = "en-US" } = req.query;
      if (!query) {
        return res.json({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        });
      }
      const response = await tmdbApi.get("/search/tv", {
        params: { query, page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tmdb/search/multi", async (req, res) => {
    try {
      const { query, page = 1, language = "en-US" } = req.query;
      if (!query) {
        return res.json({
          results: [],
          page: 1,
          total_pages: 0,
          total_results: 0,
        });
      }
      const response = await tmdbApi.get("/search/multi", {
        params: { query, page, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Person endpoints
  app.get("/api/tmdb/person/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { append_to_response, language = "en-US" } = req.query;
      const response = await tmdbApi.get(`/person/${id}`, {
        params: { append_to_response, language },
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB API error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
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

  const httpServer = createServer(app);

  return httpServer;
}
