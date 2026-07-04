import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env variables manually from .env
const loadEnv = () => {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found in current directory.');
    process.exit(1);
  }
  const envLines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    env[key] = val;
  }
  return env;
};

const env = loadEnv();
const TMDB_API_KEY = env.TMDB_API_KEY || 'a41b02f307961667ec6d02eb1dcf365c';
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const movieGenres = new Map([
  [28, 'Action'], [12, 'Adventure'], [16, 'Animation'], [35, 'Comedy'],
  [80, 'Crime'], [18, 'Drama'], [14, 'Fantasy'], [27, 'Horror'],
  [10402, 'Music'], [9648, 'Mystery'], [10749, 'Romance'], [878, 'Sci-Fi'],
  [53, 'Thriller'], [10752, 'War'], [99, 'Documentary']
]);

const tvGenres = new Map([
  [16, 'Animation'], [35, 'Comedy'], [80, 'Crime'], [18, 'Drama'],
  [10759, 'Action'], [10762, 'Kids'], [9648, 'Mystery'], [10765, 'Sci-Fi'],
  [10768, 'War'], [37, 'Western'], [99, 'Documentary']
]);

const tmdbFetch = async (endpoint, params = {}) => {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('include_adult', 'false');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json();
};

const getRating = (type) => {
  if (type === 'tv') {
    const ratings = ['TV-MA', 'TV-14', 'TV-PG', 'TV-PG'];
    return ratings[Math.floor(Math.random() * ratings.length)];
  } else {
    const ratings = ['R', 'PG-13', 'PG-13', 'PG', 'G'];
    return ratings[Math.floor(Math.random() * ratings.length)];
  }
};

const getDuration = (type) => {
  if (type === 'tv') {
    const seasons = Math.floor(Math.random() * 5) + 1;
    return seasons === 1 ? '1 Season' : `${seasons} Seasons`;
  } else {
    const minutes = Math.floor(Math.random() * 60) + 90;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
};

const getMatchRate = (voteAvg) => {
  const base = voteAvg ? Math.round(voteAvg * 10) : 85;
  return `${Math.min(99, Math.max(70, base + Math.floor(Math.random() * 6) - 3))}%`;
};

const seedCategories = [
  { key: 'trending', endpoint: '/trending/all/week', params: {} },
  { key: 'toprated', endpoint: '/movie/top_rated', params: {} },
  { key: 'action', endpoint: '/discover/movie', params: { with_genres: '28' } },
  { key: 'comedy', endpoint: '/discover/movie', params: { with_genres: '35' } },
  { key: 'horror', endpoint: '/discover/movie', params: { with_genres: '27' } },
  { key: 'romance', endpoint: '/discover/movie', params: { with_genres: '10749' } },
  { key: 'scifi', endpoint: '/discover/movie', params: { with_genres: '878' } },
  { key: 'documentaries', endpoint: '/discover/movie', params: { with_genres: '99' } },
  { key: 'popular', endpoint: '/movie/popular', params: {} }
];

async function startSeeding() {
  console.log('==================================================');
  console.log('  Qstream Dynamic Catalog Seeder - 150+ Entries  ');
  console.log('==================================================');
  
  try {
    // 1. Fetch movies and TV shows from TMDB for all categories
    const moviesToInsert = [];
    const seenTitles = new Set(); // deduplicate inside same category

    for (const cat of seedCategories) {
      console.log(`Fetching page 1 and 2 for category: ${cat.key}...`);
      
      // Fetch page 1 and page 2 to get 40 items per category
      for (const page of [1, 2]) {
        try {
          const data = await tmdbFetch(cat.endpoint, { ...cat.params, page: String(page) });
          const results = data.results || [];
          
          for (const item of results) {
            if (!item.backdrop_path && !item.poster_path) continue;
            
            const type = item.media_type || (cat.endpoint.includes('/tv') || cat.params.with_networks ? 'tv' : 'movie');
            const title = item.title || item.name || 'Untitled';
            
            // Generate a unique key per category to prevent duplicating same movie in same row
            const dedupKey = `${cat.key}_${title}`;
            if (seenTitles.has(dedupKey)) continue;
            seenTitles.add(dedupKey);

            const genresList = item.genre_ids || [];
            const genreMap = type === 'tv' ? tvGenres : movieGenres;
            const genres = genresList
              .map(id => genreMap.get(id))
              .filter(Boolean)
              .slice(0, 3);
            
            if (genres.length === 0) {
              genres.push(type === 'tv' ? 'Series' : 'Feature');
            }

            moviesToInsert.push({
              title,
              image: item.backdrop_path 
                ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` 
                : `https://image.tmdb.org/t/p/w780${item.poster_path}`,
              match: getMatchRate(item.vote_average),
              rating: getRating(type),
              duration: getDuration(type),
              genres,
              tmdb_id: String(item.id),
              type,
              category: cat.key
            });
          }
        } catch (err) {
          console.error(`Warning: Failed to fetch page ${page} for ${cat.key}:`, err.message);
        }
      }
    }

    console.log(`\nSuccessfully compiled ${moviesToInsert.length} items from TMDB!`);

    // 2. Truncate existing movies in Supabase
    console.log('Clearing existing movies from Supabase...');
    const { error: truncateError } = await supabase
      .from('movies')
      .delete()
      .neq('title', 'FORCE_DELETE_ALL_ITEMS_BY_REMOVING_NON_MATCHING_FIELD'); // deletes all rows

    if (truncateError) {
      console.error('Warning: Could not truncate table. RLS might be enabled. Trying to insert anyway...');
    }

    // 3. Batch insert movies into Supabase (in chunks of 50 to avoid payload limits)
    console.log(`Inserting ${moviesToInsert.length} items into Supabase...`);
    const chunkSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < moviesToInsert.length; i += chunkSize) {
      const chunk = moviesToInsert.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from('movies')
        .insert(chunk);

      if (insertError) {
        console.error(`\nError: Failed to insert chunk starting at index ${i}:`, insertError.message);
        console.error('If you get RLS errors, please temporarily disable Row Level Security on the "movies" table in your Supabase Editor:');
        console.error('  ALTER TABLE public.movies DISABLE ROW LEVEL SECURITY;');
        process.exit(1);
      }
      
      insertedCount += chunk.length;
      process.stdout.write(`Inserted ${insertedCount}/${moviesToInsert.length} movies...\r`);
    }

    console.log(`\n\nSuccess! Successfully populated the Supabase 'movies' table with ${insertedCount} catalog items!`);
    console.log('Enjoy your fully loaded database-backed catalog! 🎉');
    
  } catch (error) {
    console.error('\nFatal Error in Seeder:', error.message);
    process.exit(1);
  }
}

startSeeding();
