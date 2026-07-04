# Qstream 🎬

Qstream is a feature-rich, high-performance Netflix-style streaming web application built with **React 19**, **Vite**, and **Supabase** (with an alternative **Express/Node.js** backend). It offers an immersive user experience, combining database-backed cataloging, secure user authentication, profile-specific watchlists, and dynamic UI elements.

---

## 🚀 Key Features

*   **Cinematic "Tudum" Intro Loader**: Plays a synthesized audio chime using the Web Audio API coupled with a responsive, glowing 3D-scale SVG atomic orbital animation upon user authentication.
*   **Multi-Profile Management**: Supports up to 5 individual user profiles per account, each featuring customized profile names, avatars, and specific color themes.
*   **Dynamic Media Catalog**: Integrates over 150+ movie and TV show titles seeded directly from the TMDB (The Movie Database) API, categorized into 9 curated rows (Trending, Top Rated, Sci-Fi, Comedy, etc.).
*   **Personalized Watchlist ("My List")**: Allows users to dynamically toggle movies/TV shows in a real-time, profile-specific watchlist.
*   **Custom Interactive Video Streamer**: Interactive mock video player supporting seamless playback controls, including episode and season selectors for TV shows.
*   **Real-time Search Engine**: A highly efficient client-side filtering system that searches across titles and genres with instant suggestions and automatic duplicate suppression.
*   **Robust Account Controls**: Features full credential management, including profile metadata updates, secure password changing, and permanent account deletion powered by Supabase RPC database triggers.
*   **Vibrant Glassmorphic UI/UX**: Designed with a sleek, dark-mode Netflix aesthetic, horizontal sliding movie rows, dynamic billboard banners, and beautiful hover cards.

---

## 🛠️ Tech Stack

### Frontend
*   **Core**: React 19, JavaScript (ES6+)
*   **Build Tool**: Vite
*   **Routing**: React Router DOM (v7)
*   **Styling**: Vanilla CSS (Modern CSS variables, flexbox, grid, keyframe animations)
*   **Icons**: Lucide React

### Backend & Database (Dual Architecture)
*   **Option A (Serverless - Default)**: 
    *   **Supabase**: Managed database (PostgreSQL) and Supabase Auth.
    *   **Row-Level Security (RLS)**: Secured database tables (`movies`, `profiles`, `watchlists`) with custom policies.
*   **Option B (Custom Express Server - Local Dev)**:
    *   **Node.js & Express**: Custom API endpoints for authentication, profile CRUD, and watchlists.
    *   **Authentication**: JSON Web Tokens (JWT) for secure session tracking.
    *   **Local JSON Database**: Flat-file JSON store (`db.json`) for lightweight local setup.

---

## 📂 Project Structure

```
├── server/                 # Express backend server (Option B)
│   ├── server.js           # Express API endpoints & TMDB integration
│   └── db.json             # Local JSON database for offline development
├── src/                    # Frontend React application
│   ├── assets/             # Static files and assets
│   ├── components/         # Reusable UI components (Navbar, MovieRow, StreamingModal, etc.)
│   ├── pages/              # Page views (Homepage, Loginpage, Profilepage, Accountpage)
│   ├── services/           # Supabase client config and generic API interface
│   │   ├── supabaseClient.js
│   │   └── api.js          # Direct client-to-Supabase services mapping
│   ├── App.jsx             # Main application layout, routing, and Tudum loader
│   ├── index.css           # Global typography & layout styling
│   └── main.jsx            # React root mount definition
├── seedCatalog.js          # Independent node script to seed 150+ items from TMDB to Supabase
├── vercel.json             # Vercel serverless functions deployment config
└── vite.config.js          # Vite compilation config
```

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   NPM
*   A Supabase account (if using Supabase backend)
*   A TMDB API Key (if seeding catalog or running the Express server)

### Step-by-Step Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/qstream.git
    cd qstream
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    # TMDB API Configuration
    TMDB_API_KEY=your_tmdb_api_key_here
    TMDB_BEARER_TOKEN=your_optional_tmdb_bearer_token

    # Supabase Serverless Configuration
    VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Database Seeding (Supabase)**:
    Populate your Supabase `movies` table with the TMDB catalog:
    ```bash
    node seedCatalog.js
    ```
    *Note: Ensure that Row Level Security (RLS) is disabled or appropriate insert policies are configured on the `movies` table before running the seeder.*

5.  **Run Locally (Supabase Client-Only Mode)**:
    ```bash
    npm run dev
    ```

6.  **Run with Express Backend (Optional)**:
    ```bash
    # Run client
    npm run dev
    # Run express server in another terminal
    npm run server
    ```

---

## 🔐 Database Schema

If configuring Supabase manually, the following database tables should be created:

1.  **`movies`**:
    *   `id` (BigInt, PK)
    *   `title` (Text)
    *   `image` (Text)
    *   `match` (Text)
    *   `rating` (Text)
    *   `duration` (Text)
    *   `genres` (Array of Text)
    *   `tmdb_id` (Text)
    *   `type` (Text)
    *   `category` (Text)

2.  **`profiles`**:
    *   `id` (UUID or Text, PK)
    *   `user_id` (UUID, References auth.users.id)
    *   `name` (Text)
    *   `avatar` (Text)
    *   `color` (Text)

3.  **`watchlists`**:
    *   `id` (BigInt, PK)
    *   `profile_id` (Text, References profiles.id)
    *   `movie_id` (Text)

---

## 📄 License

This project is licensed under the MIT License.
