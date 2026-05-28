import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadEnvFile = () => {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const envLines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of envLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadEnvFile();

const DB_PATH = process.env.VERCEL === '1'
  ? path.join(process.cwd(), 'server', 'db.json')
  : path.join(__dirname, 'db.json');
const JWT_SECRET = 'qstream_clone_secret_key_2026';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || '';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const movieGenres = new Map([
  [28, 'Action'], [12, 'Adventure'], [16, 'Animation'], [35, 'Comedy'],
  [80, 'Crime'], [18, 'Drama'], [14, 'Fantasy'], [27, 'Horror'],
  [10402, 'Music'], [9648, 'Mystery'], [10749, 'Romance'], [878, 'Sci-Fi'],
  [53, 'Thriller'], [10752, 'War'], [37, 'Western']
]);

const tvGenres = new Map([
  [16, 'Animation'], [35, 'Comedy'], [80, 'Crime'], [18, 'Drama'],
  [10759, 'Action'], [10762, 'Kids'], [9648, 'Mystery'], [10765, 'Sci-Fi'],
  [10768, 'War'], [37, 'Western']
]);

const getTmdbHeaders = () => ({
  accept: 'application/json',
  ...(TMDB_BEARER_TOKEN ? { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` } : {})
});

const tmdbFetch = async (endpoint, params = {}) => {
  if (!TMDB_BEARER_TOKEN && !TMDB_API_KEY) {
    throw new Error('TMDB credentials are not configured.');
  }

  const url = new URL(`${TMDB_API_BASE}${endpoint}`);
  Object.entries({ language: 'en-US', include_adult: 'false', ...params }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  if (!TMDB_BEARER_TOKEN) {
    url.searchParams.set('api_key', TMDB_API_KEY);
  }

  const response = await fetch(url, { headers: getTmdbHeaders() });
  if (!response.ok) {
    throw new Error(`TMDB request failed with ${response.status}`);
  }
  return response.json();
};

const normalizeTmdbItem = (item, fallbackType = 'movie') => {
  const type = item.media_type === 'tv' || fallbackType === 'tv' ? 'tv' : 'movie';
  const title = item.title || item.name || 'Untitled';
  const genreMap = type === 'tv' ? tvGenres : movieGenres;
  const genres = (item.genre_ids || [])
    .map(id => genreMap.get(id))
    .filter(Boolean)
    .slice(0, 3);

  return {
    id: `tmdb_${type}_${item.id}`,
    title,
    image: item.backdrop_path
      ? `${TMDB_IMAGE_BASE}${item.backdrop_path}`
      : `${TMDB_IMAGE_BASE}${item.poster_path}`,
    match: `${Math.max(75, Math.round((item.vote_average || 7.5) * 10))}%`,
    rating: type === 'tv' ? 'TV-MA' : 'PG-13',
    duration: type === 'tv'
      ? 'Series'
      : (item.release_date ? item.release_date.slice(0, 4) : 'Movie'),
    genres: genres.length ? genres : [type === 'tv' ? 'Series' : 'Movie'],
    isAdded: false,
    tmdbId: String(item.id),
    type
  };
};

// Blacklist of explicit/steamy adult titles and contextual overview keywords
const EXPLICIT_TITLE_BLACKLIST = [
  'damage', 'fifty shades of grey', 'fifty shades darker', 'fifty shades freed',
  '365 days', '365 days: this day', 'the next 365 days', 'erotic', 'nymphomaniac',
  'emmanuelle', 'lust', 'deep throat', 'caligula', 'eyes wide shut', 'eroticism', 'shame',
  'money shot', 'pornhub', 'hot girls wanted', 'sexy', 'porn', 'skin. like. sun.',
  'nude', 'virgin', 'monika', 'obsession', 'clitoris',
  'after we collided', 'after we fell', 'after ever happy', 'after everything',
  'my fault', 'culpa mia', 'culpa mía', '9 songs'
];

const EXPLICIT_OVERVIEW_KEYWORDS = [
  'erotic drama', 'erotic thriller', 'steamy romance', 'steamy relationship',
  'steamy affair', 'sexual relationship', 'sensual relationship', 'steamy encounters',
  'erotic romance', 'erotic encounter', 'nudity', 'graphic nudity', 'nude', 'suggestive',
  'sensual', 'sexual scene', 'sexual encounter'
];

const isAdultOrSuggestiveContent = (item) => {
  if (!item) return false;
  if (item.adult === true) return true;

  // Normalize fields to lowercase
  const title = (item.title || item.name || '').toLowerCase();
  const overview = (item.overview || '').toLowerCase();

  // Strict check for the exact title 'after' (avoiding blocking After Earth, etc.)
  if (title.trim() === 'after') return true;

  // 1. Strict exact title matches or word boundary/substring checks
  const containsBlacklistedTitle = EXPLICIT_TITLE_BLACKLIST.some(black => {
    // Punctuation-insensitive substring check (e.g., 'skin like sun' matches 'Skin. Like. Sun.')
    const cleanTitle = title.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanBlack = black.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanTitle.includes(cleanBlack)) return true;

    const regex = new RegExp(`\\b${black}\\b`, 'i');
    return regex.test(title);
  });
  if (containsBlacklistedTitle) return true;

  // 2. Suggestive description keywords check
  const containsBlacklistedOverview = EXPLICIT_OVERVIEW_KEYWORDS.some(kw => overview.includes(kw));
  if (containsBlacklistedOverview) return true;

  return false;
};

const cleanResults = (results, fallbackType = 'movie') => {
  return (results || [])
    .filter(item => !isAdultOrSuggestiveContent(item))
    .map(item => normalizeTmdbItem(item, fallbackType));
};

const uniqueMovies = (items) => {
  const seen = new Set();
  return items.filter(item => {
    if (!item?.id || !item?.image || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// --- Database Helper Methods (with in-memory cache for Vercel Serverless) ---
let dbCache = null;

const readDB = () => {
  if (dbCache) return dbCache;
  try {
    if (!fs.existsSync(DB_PATH)) {
      dbCache = { users: [], profiles: [], watchlists: [] };
      return dbCache;
    }
    const data = fs.readFileSync(DB_PATH, 'utf8');
    dbCache = JSON.parse(data);
    return dbCache;
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    dbCache = { users: [], profiles: [], watchlists: [] };
    return dbCache;
  }
};

const writeDB = (data) => {
  dbCache = data;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to local JSON database:', error);
    return false;
  }
};

// --- Middleware: Verify JWT Tokens ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// --- AUTH ROUTERS ---

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All registration credentials are required.' });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return res.status(400).json({ message: 'Email address is already registered.' });
  }

  const newUserId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
  const newUser = {
    id: newUserId,
    fullName,
    email,
    password // Plaintext for debuggable local development simplicity
  };

  db.users.push(newUser);

  // Automatically seed a default main profile for new registers
  const defaultProfile = {
    id: `prof_${Date.now()}`,
    userId: newUserId,
    name: fullName.split(' ')[0], // First name
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    color: '#e50914'
  };
  db.profiles.push(defaultProfile);

  writeDB(db);

  // Sign Token
  const token = jwt.sign({ userId: newUserId }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: newUserId, email, fullName }
  });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const db = readDB();
  const user = db.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && String(u.password) === String(password)
  );

  if (!user) {
    return res.status(400).json({ message: 'Incorrect email or password.' });
  }

  // Sign Token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, email: user.email, fullName: user.fullName }
  });
});

// Verify active session token
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.json({
    user: { id: user.id, email: user.email, fullName: user.fullName }
  });
});

// --- CATALOG ROUTERS ---

app.get('/api/catalog', async (req, res) => {
  try {
    const [
      trending,
      topRated,
      popularMovies,
      actionMovies,
      comedyMovies,
      horrorMovies,
      romanceMovies,
      sciFiMovies,
      documentaries
    ] = await Promise.all([
      tmdbFetch('/trending/all/week', { page: '1' }),
      tmdbFetch('/movie/top_rated', { page: '1' }),
      tmdbFetch('/movie/popular', { page: '1' }),
      tmdbFetch('/discover/movie', { page: '1', sort_by: 'popularity.desc', with_genres: '28' }),
      tmdbFetch('/discover/movie', { page: '1', sort_by: 'popularity.desc', with_genres: '35' }),
      tmdbFetch('/discover/movie', { page: '1', sort_by: 'popularity.desc', with_genres: '27' }),
      tmdbFetch('/discover/movie', { page: '1', sort_by: 'popularity.desc', with_genres: '10749' }),
      tmdbFetch('/discover/movie', { page: '1', sort_by: 'popularity.desc', with_genres: '878' }),
      tmdbFetch('/discover/movie', { page: '1', sort_by: 'popularity.desc', with_genres: '99' })
    ]);

    const rows = [
      {
        id: 'trending',
        title: 'Trending Now',
        movies: uniqueMovies(cleanResults((trending.results || [])
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv'), 'movie'))
          .slice(0, 12)
      },
      {
        id: 'toprated',
        title: 'Top Rated Releases',
        movies: uniqueMovies(cleanResults(topRated.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'action',
        title: 'Action Blockbusters',
        movies: uniqueMovies(cleanResults(actionMovies.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'comedy',
        title: 'Comedy Hits',
        movies: uniqueMovies(cleanResults(comedyMovies.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'horror',
        title: 'Horror & Thrillers',
        movies: uniqueMovies(cleanResults(horrorMovies.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'romance',
        title: 'Romance & Drama',
        movies: uniqueMovies(cleanResults(romanceMovies.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'scifi',
        title: 'Sci-Fi & Cyberpunk Hits',
        movies: uniqueMovies(cleanResults(sciFiMovies.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'documentaries',
        title: 'Captivating Documentaries',
        movies: uniqueMovies(cleanResults(documentaries.results, 'movie'))
          .slice(0, 12)
      },
      {
        id: 'popular',
        title: 'Popular on QStream',
        movies: uniqueMovies(cleanResults(popularMovies.results, 'movie'))
          .slice(0, 12)
      }
    ].filter(row => row.movies.length > 0);

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch TMDB catalog:', error.message);
    res.status(503).json({
      message: TMDB_BEARER_TOKEN || TMDB_API_KEY
        ? 'Movie catalog API is temporarily unavailable.'
        : 'TMDB_API_KEY or TMDB_BEARER_TOKEN is required to fetch the live catalog.'
    });
  }
});

// --- PROFILE ROUTERS ---

// GET user profiles
app.get('/api/profiles', authenticateToken, (req, res) => {
  const db = readDB();
  const userProfiles = db.profiles.filter(p => p.userId === req.userId);
  res.json(userProfiles);
});

// POST create new profile
app.post('/api/profiles', authenticateToken, (req, res) => {
  const { name, avatar, color } = req.body;

  if (!name || !avatar || !color) {
    return res.status(400).json({ message: 'All profile configuration fields are required.' });
  }

  const db = readDB();
  const userProfiles = db.profiles.filter(p => p.userId === req.userId);

  if (userProfiles.length >= 5) {
    return res.status(400).json({ message: 'Maximum of 5 profiles allowed per account.' });
  }

  const newProfile = {
    id: `prof_${Date.now()}`,
    userId: req.userId,
    name,
    avatar,
    color
  };

  db.profiles.push(newProfile);
  writeDB(db);

  res.status(201).json(newProfile);
});

// DELETE profile
app.delete('/api/profiles/:profileId', authenticateToken, (req, res) => {
  const { profileId } = req.params;
  const db = readDB();

  const profileIndex = db.profiles.findIndex(p => p.id === profileId && p.userId === req.userId);

  if (profileIndex === -1) {
    return res.status(404).json({ message: 'Profile not found or access denied.' });
  }

  // Prevent deleting the very last profile
  const userProfiles = db.profiles.filter(p => p.userId === req.userId);
  if (userProfiles.length <= 1) {
    return res.status(400).json({ message: 'You must maintain at least one profile.' });
  }

  // Remove the profile
  db.profiles.splice(profileIndex, 1);

  // Purge associated watchlists
  db.watchlists = db.watchlists.filter(w => w.profileId !== profileId);

  writeDB(db);
  res.json({ message: 'Profile deleted successfully.' });
});

// --- WATCHLIST ROUTERS ---

// GET watchlist items
app.get('/api/watchlist/:profileId', authenticateToken, (req, res) => {
  const { profileId } = req.params;
  const db = readDB();

  // Validate ownership
  const profile = db.profiles.find(p => p.id === profileId && p.userId === req.userId);
  if (!profile) {
    return res.status(403).json({ message: 'Access denied to this profile.' });
  }

  const items = db.watchlists.filter(w => w.profileId === profileId).map(w => w.movieId);
  res.json(items);
});

// POST toggle movie in watchlist
app.post('/api/watchlist/:profileId', authenticateToken, (req, res) => {
  const { profileId } = req.params;
  const { movieId } = req.body;

  if (!movieId) {
    return res.status(400).json({ message: 'Movie/Show identifier is required.' });
  }

  const db = readDB();

  // Validate ownership
  const profile = db.profiles.find(p => p.id === profileId && p.userId === req.userId);
  if (!profile) {
    return res.status(403).json({ message: 'Access denied to this profile.' });
  }

  const itemIndex = db.watchlists.findIndex(w => w.profileId === profileId && w.movieId === movieId);
  let isAdded = false;

  if (itemIndex > -1) {
    // Already in watchlist, toggle remove it
    db.watchlists.splice(itemIndex, 1);
  } else {
    // Add to watchlist
    db.watchlists.push({
      id: `w_${Date.now()}`,
      profileId,
      movieId
    });
    isAdded = true;
  }

  writeDB(db);
  res.json({ success: true, isAdded });
});

// Start Express (only if not running under Vercel Serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  QStream API Backend is running on port ${PORT} `);
    console.log(`  Local Database Path: ${DB_PATH}             `);
    console.log(`===============================================`);
  });
}

export default app;
