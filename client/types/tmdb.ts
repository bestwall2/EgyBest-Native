export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  video: boolean;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  genres: Genre[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: Video[];
  };
  similar?: {
    results: Movie[];
  };
  recommendations?: {
    results: Movie[];
  };
}

export interface TVShowDetails extends TVShow {
  created_by: {
    id: number;
    name: string;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  genres: Genre[];
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Episode | null;
  next_episode_to_air: Episode | null;
  networks: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: Season[];
  status: string;
  tagline: string;
  type: string;
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: Video[];
  };
  similar?: {
    results: TVShow[];
  };
  recommendations?: {
    results: TVShow[];
  };
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number;
}

export interface SeasonDetails extends Season {
  episodes: Episode[];
}

export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonDetails extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
  gender: number;
  combined_credits?: {
    cast: (Movie | TVShow)[];
    crew: (Movie | TVShow)[];
  };
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MediaType = "movie" | "tv";

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  releaseDate: string;
  overview: string;
}

export interface WatchlistItem extends MediaItem {
  addedAt: string;
}

export interface FavoriteItem extends MediaItem {
  addedAt: string;
}

export interface WatchHistoryItem extends MediaItem {
  watchedAt: string;
  progress?: number;
}
