import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import HeroBanner from '../components/HeroBanner.jsx';
import MovieRow from '../components/MovieRow.jsx';
import Footer from '../components/Footer.jsx';
import StreamingModal from '../components/StreamingModal.jsx';
import { api } from '../services/api.js';
import './Homepage.css';

// Stunning high-quality mock data mapping actual famous blockbusters
const FALLBACK_CATEGORIES = [
  {
    id: 'trending',
    title: 'Trending Now',
    movies: [
      {
        id: 't1',
        title: 'Blade Runner 2049',
        image: 'https://image.tmdb.org/t/p/w780/sAtoMqDVhNDQBc3QJL3RF6hlhGq.jpg',
        match: '98%',
        rating: 'R',
        duration: '2h 44m',
        genres: ['Action', 'Sci-Fi', 'Cyberpunk'],
        isAdded: false,
        tmdbId: '335984',
        type: 'movie'
      },
      {
        id: 't2',
        title: 'Interstellar',
        image: 'https://image.tmdb.org/t/p/w780/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
        match: '95%',
        rating: 'PG-13',
        duration: '2h 49m',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        isAdded: true,
        tmdbId: '157336',
        type: 'movie'
      },
      {
        id: 't3',
        title: 'Dark',
        image: 'https://image.tmdb.org/t/p/w780/5LoHuHWA4H8jElFlZDvsmU2n63b.jpg',
        match: '92%',
        rating: 'TV-MA',
        duration: '3 Seasons',
        genres: ['Mind-bending', 'Mystery', 'Thriller'],
        isAdded: false,
        tmdbId: '70523',
        type: 'tv'
      },
      {
        id: 't4',
        title: 'Gravity',
        image: 'https://image.tmdb.org/t/p/w780/kZ2nZw8D681aphje8NJi8EfbL1U.jpg',
        match: '96%',
        rating: 'PG-13',
        duration: '1h 31m',
        genres: ['Sci-Fi', 'Thriller', 'Drama'],
        isAdded: false,
        tmdbId: '49047',
        type: 'movie'
      },
      {
        id: 't5',
        title: 'The Batman',
        image: 'https://image.tmdb.org/t/p/w780/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
        match: '89%',
        rating: 'PG-13',
        duration: '2h 56m',
        genres: ['Gritty', 'Action', 'Crime'],
        isAdded: false,
        tmdbId: '414906',
        type: 'movie'
      },
      {
        id: 't6',
        title: 'Stranger Things',
        image: 'https://image.tmdb.org/t/p/w780/56v2Kj2qUj22547rmzZJjgoV75Y.jpg',
        match: '98%',
        rating: 'TV-MA',
        duration: '4 Seasons',
        genres: ['Sci-Fi', 'Mystery', 'Retro'],
        isAdded: false,
        tmdbId: '66732',
        type: 'tv'
      }
    ]
  },
  {
    id: 'toprated',
    title: 'Top Rated Releases',
    movies: [
      {
        id: 'tr1',
        title: 'The Shawshank Redemption',
        image: 'https://image.tmdb.org/t/p/w780/9cqN025wZIMrWJ5fkIyVNsU3mZ1.jpg',
        match: '99%',
        rating: 'R',
        duration: '2h 22m',
        genres: ['Drama', 'Prison', 'Classic'],
        isAdded: false,
        tmdbId: '278',
        type: 'movie'
      },
      {
        id: 'tr2',
        title: 'The Godfather',
        image: 'https://image.tmdb.org/t/p/w780/rPdtOFSZvZn7JTH47y6UI6clOh1.jpg',
        match: '98%',
        rating: 'R',
        duration: '2h 55m',
        genres: ['Crime', 'Drama', 'Classic'],
        isAdded: false,
        tmdbId: '238',
        type: 'movie'
      },
      {
        id: 'tr3',
        title: 'The Dark Knight',
        image: 'https://image.tmdb.org/t/p/w780/nMKdUUepdz8gflSq5St4T1nN3CY.jpg',
        match: '97%',
        rating: 'PG-13',
        duration: '2h 32m',
        genres: ['Action', 'Crime', 'Thriller'],
        isAdded: false,
        tmdbId: '155',
        type: 'movie'
      },
      {
        id: 'tr4',
        title: 'Inception',
        image: 'https://image.tmdb.org/t/p/w780/8ZMRsiDC5aL59XbwBoI61Bo27zc.jpg',
        match: '96%',
        rating: 'PG-13',
        duration: '2h 28m',
        genres: ['Action', 'Sci-Fi', 'Mind-bending'],
        isAdded: false,
        tmdbId: '27205',
        type: 'movie'
      }
    ]
  },
  {
    id: 'action',
    title: 'Action Blockbusters',
    movies: [
      {
        id: 'a1',
        title: 'Mad Max: Fury Road',
        image: 'https://image.tmdb.org/t/p/w780/8tZYtuWe25PM2ty781A8X4Xg97b.jpg',
        match: '96%',
        rating: 'R',
        duration: '2h 0m',
        genres: ['Action', 'Sci-Fi', 'Post-apocalyptic'],
        isAdded: false,
        tmdbId: '76341',
        type: 'movie'
      },
      {
        id: 'a2',
        title: 'Gladiator',
        image: 'https://image.tmdb.org/t/p/w780/3QA2vNn4t1s2u85T3hTe5t2w1T4.jpg',
        match: '95%',
        rating: 'R',
        duration: '2h 35m',
        genres: ['Action', 'Adventure', 'Epic'],
        isAdded: false,
        tmdbId: '98',
        type: 'movie'
      },
      {
        id: 'a3',
        title: 'John Wick',
        image: 'https://image.tmdb.org/t/p/w780/f895rh4jo4jZk426vVygA7AEy2D.jpg',
        match: '92%',
        rating: 'R',
        duration: '1h 41m',
        genres: ['Action', 'Thriller', 'Gritty'],
        isAdded: false,
        tmdbId: '245891',
        type: 'movie'
      }
    ]
  },
  {
    id: 'comedy',
    title: 'Comedy Hits',
    movies: [
      {
        id: 'c1',
        title: 'Superbad',
        image: 'https://image.tmdb.org/t/p/w780/ek89mI4B9lA1W2Z2P5L4V6y4t3Z.jpg',
        match: '93%',
        rating: 'R',
        duration: '1h 53m',
        genres: ['Comedy', 'Teen', 'Hilarious'],
        isAdded: false,
        tmdbId: '8363',
        type: 'movie'
      },
      {
        id: 'c2',
        title: 'The Hangover',
        image: 'https://image.tmdb.org/t/p/w780/h7Svy5hGvFjPqVv64t6K16M5C7O.jpg',
        match: '92%',
        rating: 'R',
        duration: '1h 40m',
        genres: ['Comedy', 'Adventure', 'Wild'],
        isAdded: false,
        tmdbId: '13972',
        type: 'movie'
      }
    ]
  },
  {
    id: 'horror',
    title: 'Horror & Thrillers',
    movies: [
      {
        id: 'h1',
        title: 'The Conjuring',
        image: 'https://image.tmdb.org/t/p/w780/e7V9jE21e25L1tXvV9T6v8fF2uE.jpg',
        match: '94%',
        rating: 'R',
        duration: '1h 52m',
        genres: ['Horror', 'Supernatural', 'Scary'],
        isAdded: false,
        tmdbId: '138843',
        type: 'movie'
      },
      {
        id: 'h2',
        title: 'Get Out',
        image: 'https://image.tmdb.org/t/p/w780/qP6wPecn6cK1v2wF4jY5kX9u3Z4.jpg',
        match: '93%',
        rating: 'R',
        duration: '1h 44m',
        genres: ['Horror', 'Mystery', 'Suspenseful'],
        isAdded: false,
        tmdbId: '419430',
        type: 'movie'
      }
    ]
  },
  {
    id: 'romance',
    title: 'Romance & Drama',
    movies: [
      {
        id: 'r1',
        title: 'La La Land',
        image: 'https://image.tmdb.org/t/p/w780/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
        match: '94%',
        rating: 'PG-13',
        duration: '2h 8m',
        genres: ['Romantic', 'Musical', 'Drama'],
        isAdded: false,
        tmdbId: '313369',
        type: 'movie'
      },
      {
        id: 'r2',
        title: 'About Time',
        image: 'https://image.tmdb.org/t/p/w780/7O09Kx1l5nJ7V65W9mF2uE3X2uG.jpg',
        match: '95%',
        rating: 'R',
        duration: '2h 3m',
        genres: ['Romance', 'Fantasy', 'Emotional'],
        isAdded: false,
        tmdbId: '122906',
        type: 'movie'
      }
    ]
  },
  {
    id: 'scifi',
    title: 'Sci-Fi & Cyberpunk Hits',
    movies: [
      {
        id: 's1',
        title: 'Ghost in the Shell',
        image: 'https://image.tmdb.org/t/p/w780/6iUNJZymJBMXXriQyFZfLAKnjO6.jpg',
        match: '97%',
        rating: 'PG-13',
        duration: '1h 47m',
        genres: ['Dystopian', 'Action', 'Sci-Fi'],
        isAdded: false,
        tmdbId: '9323',
        type: 'movie'
      },
      {
        id: 's2',
        title: 'The Matrix',
        image: 'https://image.tmdb.org/t/p/w780/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
        match: '91%',
        rating: 'R',
        duration: '2h 16m',
        genres: ['Cyberpunk', 'Action', 'Sci-Fi'],
        isAdded: false,
        tmdbId: '603',
        type: 'movie'
      },
      {
        id: 's3',
        title: 'Black Mirror',
        image: 'https://image.tmdb.org/t/p/w780/8YFL5QQVPy3AgrEQxNYVSgiPEbe.jpg',
        match: '90%',
        rating: 'TV-MA',
        duration: '6 Seasons',
        genres: ['Anthology', 'Dark', 'Technological'],
        isAdded: false,
        tmdbId: '42009',
        type: 'tv'
      },
      {
        id: 's4',
        title: 'Cyberpunk: Edgerunners',
        image: 'https://image.tmdb.org/t/p/w780/7jSWOc6jWSw5hZ78HB8Hw3pJxuk.jpg',
        match: '94%',
        rating: 'TV-MA',
        duration: '10 Episodes',
        genres: ['Action', 'Sci-Fi', 'Anime'],
        isAdded: true,
        tmdbId: '108978',
        type: 'tv'
      },
      {
        id: 's5',
        title: 'Ex Machina',
        image: 'https://image.tmdb.org/t/p/w780/uqOuJ50EtTj7kkDIXP8LCg7G45D.jpg',
        match: '96%',
        rating: 'R',
        duration: '1h 48m',
        genres: ['Sci-Fi', 'Suspenseful', 'Drama'],
        isAdded: false,
        tmdbId: '264660',
        type: 'movie'
      }
    ]
  },
  {
    id: 'documentaries',
    title: 'Captivating Documentaries',
    movies: [
      {
        id: 'd1',
        title: 'Free Solo',
        image: 'https://image.tmdb.org/t/p/w780/6X2pYkUeK7F1r5Wp9y2w8fF2uE.jpg',
        match: '96%',
        rating: 'PG-13',
        duration: '1h 40m',
        genres: ['Documentary', 'Adventure', 'Intense'],
        isAdded: false,
        tmdbId: '515042',
        type: 'movie'
      },
      {
        id: 'd2',
        title: 'The Social Dilemma',
        image: 'https://image.tmdb.org/t/p/w780/6X2pYkUeK7F1r5Wp9y2w8fF2uE.jpg',
        match: '92%',
        rating: 'PG-13',
        duration: '1h 33m',
        genres: ['Documentary', 'Technology', 'Insightful'],
        isAdded: false,
        tmdbId: '656561',
        type: 'movie'
      }
    ]
  },
  {
    id: 'popular',
    title: 'Popular on QStream',
    movies: [
      {
        id: 'p1',
        title: 'Avatar',
        image: 'https://image.tmdb.org/t/p/w780/vL5LR6WdxWPjLPFRLe133jXWsh5.jpg',
        match: '97%',
        rating: 'PG-13',
        duration: '2h 42m',
        genres: ['Fantasy', 'Sci-Fi', 'Adventure'],
        isAdded: false,
        tmdbId: '19995',
        type: 'movie'
      },
      {
        id: 'p2',
        title: 'Everest',
        image: 'https://image.tmdb.org/t/p/w780/4xmndWnTYTE4bDdlWrkZyaGcZlo.jpg',
        match: '93%',
        rating: 'PG-13',
        duration: '2h 1m',
        genres: ['Nature', 'Survival', 'Adventure'],
        isAdded: false,
        tmdbId: '273481',
        type: 'movie'
      },
      {
        id: 'p3',
        title: 'Whiplash',
        image: 'https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
        match: '95%',
        rating: 'R',
        duration: '1h 46m',
        genres: ['Music', 'Emotional', 'Drama'],
        isAdded: true,
        tmdbId: '244786',
        type: 'movie'
      },
      {
        id: 'p4',
        title: 'Rick and Morty',
        image: 'https://image.tmdb.org/t/p/w780/rBF8wVQN8hTWHspVZBlI3h7HZJ.jpg',
        match: '88%',
        rating: 'TV-MA',
        duration: '7 Seasons',
        genres: ['Sci-Fi', 'Comedy', 'Animation'],
        isAdded: false,
        tmdbId: '60625',
        type: 'tv'
      }
    ]
  }
];

// Real-time metadata for television episodes
const TV_EPISODES = {
  // Stranger Things (tmdbId = '66732')
  '66732': {
    '1': [
      {
        episodeNum: 1,
        title: "Chapter One: The Vanishing of Will Byers",
        duration: "48m",
        description: "On his way home from a friend's house, young Will sees something terrifying. Nearby, a secret government lab harbors a sinister gateway.",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 2,
        title: "Chapter Two: The Weirdo on Maple Street",
        duration: "55m",
        description: "Lucas, Mike and Dustin try to talk to the girl they found in the woods. Chief Hopper questions a deeply anxious Joyce about Will's eerie phone calls.",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 3,
        title: "Chapter Three: Holly, Jolly",
        duration: "51m",
        description: "An increasingly frantic Joyce tries to communicate with Will via Christmas light lines. Nancy investigates her best friend Barbara's sudden disappearance.",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 4,
        title: "Chapter Four: The Body",
        duration: "50m",
        description: "Refusing to believe Will is dead despite the search crew findings, Joyce tries to connect with her son. The boys give Eleven a classic retro makeover.",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 5,
        title: "Chapter Five: The Flea and the Acrobat",
        duration: "53m",
        description: "Hopper breaks into the laboratory to search for Will. The boys ask Mr. Clarke about traveling to alternate dimensions to track down the gate.",
        thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&h=170&q=80"
      }
    ],
    '2': [
      {
        episodeNum: 1,
        title: "Chapter One: MADMAX",
        duration: "48m",
        description: "As the town prepares for Halloween, a high-scoring newcomer shakes up things at the local arcade. A skeptical Hopper inspects a field of rotting pumpkins.",
        thumbnail: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 2,
        title: "Chapter Two: Trick or Treat, Freak",
        duration: "56m",
        description: "After Will sees something terrible on trick-or-treat night, Mike wonders if Eleven is still out there. Nancy struggles with the truth about Barb.",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 3,
        title: "Chapter Three: The Pollywog",
        duration: "51m",
        description: "Dustin adopts a strange, slimy new pet, and Eleven grows increasingly frustrated. Well-meaning Bob urges Will to stand up to his fears.",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=170&q=80"
      }
    ],
    '3': [
      {
        episodeNum: 1,
        title: "Chapter One: Suzie, Do You Copy?",
        duration: "50m",
        description: "Summer brings new jobs and budding romance to Hawkins. But the radio transmitter picks up a Russian broadcast, and Dustin senses a strange threat.",
        thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 2,
        title: "Chapter Two: The Mall Rats",
        duration: "50m",
        description: "Nancy and Jonathan follow a lead, while Steve and Robin sign up for a secret mission. Max and Eleven go shopping. Billy has a terrifying vision.",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 3,
        title: "Chapter Three: The Case of the Missing Lifeguard",
        duration: "49m",
        description: "With Eleven and Max searching for Billy, Will plans a day without girls. Steve and Dustin run a stakeout, and Joyce fears for Hopper's safety.",
        thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&h=170&q=80"
      }
    ],
    '4': [
      {
        episodeNum: 1,
        title: "Chapter One: The Hellfire Club",
        duration: "1h 18m",
        description: "Now in high school, Dustin and Mike join a D&D club. Meanwhile, a dark threat looms over Hawkins, and a strange death sends shockwaves.",
        thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 2,
        title: "Chapter Two: Vecna's Curse",
        duration: "1h 17m",
        description: "Mike travels to California to visit Eleven. Meanwhile, in Hawkins, Max tries to understand her strange visions as police hunt for answers.",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 3,
        title: "Chapter Three: The Monster and the Superhero",
        duration: "1h 3m",
        description: "Eleven faces consequences in California. In Hawkins, the group searches for clues about the demonic entity that has been terrorizing the town.",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=170&q=80"
      }
    ]
  },
  // Dark (tmdbId = '70523')
  '70523': [
    {
      episodeNum: 1,
      title: "Secrets",
      duration: "47m",
      description: "In 2019, a local boy's disappearance stokes fear in Winden, a German town with a strange and tragic history and an imposing nuclear facility.",
      thumbnail: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Lies",
      duration: "45m",
      description: "When a gruesome discovery leaves police baffled, Ulrich searches the power plant grounds. A bizarre stranger arrives in town and checks in at the hotel.",
      thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 3,
      title: "Past and Present",
      duration: "46m",
      description: "It's 1986, and Ulrich's brother Mads has been missing for a month. Tension rises between adolescent Ulrich and his mother, Katharina.",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // Rick and Morty (tmdbId = '60625')
  '60625': [
    {
      episodeNum: 1,
      title: "Pilot",
      duration: "22m",
      description: "Rick moves in with his daughter's family and begins to exert a massive, dangerous influence on his young, highly anxious grandson, Morty.",
      thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Lawnmower Dog",
      duration: "22m",
      description: "Rick builds a device to make the family dog, Snuffles, smarter. Meanwhile, Rick and Morty enter the dreams of Morty's math teacher to secure high grades.",
      thumbnail: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 3,
      title: "Anatomy Park",
      duration: "22m",
      description: "Rick shrinks Morty and injects him into a homeless man to save Anatomy Park, a microscopic theme park filled with deadly infectious diseases.",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // Cyberpunk: Edgerunners (tmdbId = '108978')
  '108978': [
    {
      episodeNum: 1,
      title: "Let You Down",
      duration: "25m",
      description: "Living in the dystopian neon slums of Santo Domingo, street kid David Martinez attends the prestigious Arasaka Academy at his mother's immense sacrifices.",
      thumbnail: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Like a Boy",
      duration: "25m",
      description: "After installing the heavy military-grade Sandevistan cyberware into his own spine, David seeks out a mysterious girl named Lucy on the bullet train.",
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 3,
      title: "Smooth Criminal",
      duration: "25m",
      description: "David confronts a legendary crew of local edgerunners headed by the cyber-implanted Maine, demanding a trial to prove his metal as a mercenary.",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // Squid Game (tmdbId = '93405')
  '93405': [
    {
      episodeNum: 1,
      title: "Red Light, Green Light",
      duration: "60m",
      description: "Hoping to win easy money, Gi-hun agrees to play a mysterious game. But the first round turns into an unexpected, bloody nightmare.",
      thumbnail: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Hell",
      duration: "63m",
      description: "Split on whether to continue the game or walk away, the players hold a vote. But the realities of their debt-ridden lives outside prove just as brutal.",
      thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 3,
      title: "The Man with the Umbrella",
      duration: "54m",
      description: "Players enter the second round, which involves extracting a shape from a honeycomb. Gi-hun uses a clever trick to save his life.",
      thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // Crash Landing on You (tmdbId = '94796')
  '94796': [
    {
      episodeNum: 1,
      title: "Episode 1",
      duration: "1h 10m",
      description: "South Korean heiress Yoon Se-ri is caught in a sudden storm while paragliding and accidentally crashes over the DMZ border into North Korea.",
      thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Episode 2",
      duration: "1h 15m",
      description: "North Korean army officer Ri Jeong-hyeok decides to hide Se-ri in his home while trying to devise a secure plan to smuggle her back home.",
      thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // All of Us Are Dead (tmdbId = '99966')
  '99966': [
    {
      episodeNum: 1,
      title: "Episode 1",
      duration: "1h 2m",
      description: "A student is bitten by a lab hamster, triggering a zombie virus outbreak. High schoolers are trapped and must fight for survival.",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Episode 2",
      duration: "1h 5m",
      description: "As the infected multiply rapidly, students barricade themselves in a classroom and try to find a way to contact the authorities.",
      thumbnail: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // Business Proposal (tmdbId = '154825')
  '154825': [
    {
      episodeNum: 1,
      title: "Episode 1",
      duration: "60m",
      description: "Ha-ri agrees to go on a blind date in place of her wealthy friend to get rejected, only to discover the date is her company's new CEO.",
      thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=170&q=80"
    },
    {
      episodeNum: 2,
      title: "Episode 2",
      duration: "60m",
      description: "CEO Tae-moo is determined to marry his blind date to stop his grandfather's nagging, forcing Ha-ri to play along with a fake identity.",
      thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=170&q=80"
    }
  ],
  // Kingdom (tmdbId = '70593')
  '70593': {
    '1': [
      {
        episodeNum: 1,
        title: "Episode 1",
        duration: "56m",
        description: "An outbreak of a mysterious plague begins to spread in the southern province of Dongnae. The crown prince travels to investigate.",
        thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&h=170&q=80"
      },
      {
        episodeNum: 2,
        title: "Episode 2",
        duration: "56m",
        description: "Jeong-seok and Seo-bi discover that the bodies of the dead come alive at night, seeking human flesh.",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&h=170&q=80"
      }
    ],
    '2': [
      {
        episodeNum: 1,
        title: "Episode 1",
        duration: "45m",
        description: "An unexpected setback at Sangju turns the prince's strategy upside down. Seo-bi discovers a critical detail about the plague's behavior.",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&h=170&q=80"
      }
    ]
  }
};

function Homepage({ onLogout }) {
  const [movieRows, setMovieRows] = useState(FALLBACK_CATEGORIES);
  
  // Dynamic Tab and Search states
  const [activeTab, setActiveTab] = useState('Home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Streaming modal states
  const [activeStream, setActiveStream] = useState(null); // { tmdbId, type, title, season, episode }

  // Fetch catalog from API, then merge profile watchlist state from the backend.
  useEffect(() => {
    let isMounted = true;

    const fetchCatalog = async () => {
      let catalogRows = FALLBACK_CATEGORIES;

      try {
        const apiRows = await api.getCatalog();
        if (Array.isArray(apiRows) && apiRows.length > 0) {
          catalogRows = apiRows;
        }
      } catch (error) {
        console.error('Failed to load API catalog. Using fallback catalog:', error);
      }

      const activeProfileId = localStorage.getItem('netflix_selected_profile_id');

      if (activeProfileId) {
        try {
          const watchlistMovieIds = await api.getWatchlist(activeProfileId);
          const watchlistSet = new Set(watchlistMovieIds);

          catalogRows = catalogRows.map(category => ({
            ...category,
            movies: category.movies.map(movie => ({
              ...movie,
              isAdded: watchlistSet.has(movie.id)
            }))
          }));
        } catch (error) {
          console.error('Failed to load watchlist from backend database:', error);
        }
      }

      if (isMounted) {
        setMovieRows(catalogRows.map(category => ({
          ...category,
          movies: category.movies.map(movie => ({
            ...movie,
            isAdded: Boolean(movie.isAdded)
          }))
        })));
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle movie in profile watchlist on the database backend
  const toggleMyList = async (movieId) => {
    const activeProfileId = localStorage.getItem('netflix_selected_profile_id');
    if (!activeProfileId) {
      alert("Please select a profile first!");
      return;
    }

    // Find the movie title to sync all duplicate entries on the client
    let movieTitle = '';
    for (const row of movieRows) {
      const found = row.movies.find(m => m.id === movieId);
      if (found) {
        movieTitle = found.title;
        break;
      }
    }

    try {
      const res = await api.toggleWatchlist(activeProfileId, movieId);
      
      // Update frontend state immediately for all movies sharing the same title
      setMovieRows(prevRows => prevRows.map(row => ({
        ...row,
        movies: row.movies.map(movie => {
          const matchTitle = movieTitle && movie.title.toLowerCase().trim() === movieTitle.toLowerCase().trim();
          if (movie.id === movieId || matchTitle) {
            return { ...movie, isAdded: res.isAdded };
          }
          return movie;
        })
      })));
    } catch (error) {
      console.error('Failed to toggle watchlist item:', error);
    }
  };

  const handlePlayClick = (item) => {
    if (typeof item === 'string') {
      setActiveStream({
        tmdbId: '66732', // Stranger Things
        type: 'tv',
        title: 'Stranger Things',
        season: 1,
        episode: 1
      });
      return;
    }
    
    setActiveStream({
      tmdbId: item.tmdbId,
      type: item.type,
      title: item.title,
      season: item.type === 'tv' ? 1 : null,
      episode: item.type === 'tv' ? 1 : null
    });
  };

  const handleCloseStream = () => {
    setActiveStream(null);
  };

  const handleEpisodeSelect = (episodeNum) => {
    setActiveStream(prev => ({
      ...prev,
      episode: episodeNum
    }));
  };

  const handleSeasonSelect = (seasonNum) => {
    setActiveStream(prev => ({
      ...prev,
      season: seasonNum,
      episode: 1
    }));
  };

  // --- Real-time Catalog Filtering Engine ---
  const getFilteredRows = () => {
    // 1. Search Query filtering takes absolute priority
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const allMovies = movieRows.flatMap(r => r.movies);
      
      // Deduplicate movies by title to prevent duplicates in search results
      const uniqueMovies = [];
      const seen = new Set();
      for (const m of allMovies) {
        const titleKey = m.title.toLowerCase().trim();
        if (!seen.has(titleKey)) {
          seen.add(titleKey);
          uniqueMovies.push(m);
        }
      }
      
      const matched = uniqueMovies.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.genres.some(g => g.toLowerCase().includes(query))
      );
      
      return [
        {
          id: 'search-results',
          title: `Search Results for "${searchQuery}"`,
          movies: matched
        }
      ];
    }

    // 2. Tab Navigation Filtering
    if (activeTab === 'Movies') {
      return movieRows.map(row => ({
        ...row,
        movies: row.movies.filter(m => m.type === 'movie')
      })).filter(row => row.movies.length > 0);
    }
    
    if (activeTab === 'TV Shows') {
      return movieRows.map(row => ({
        ...row,
        movies: row.movies.filter(m => m.type === 'tv')
      })).filter(row => row.movies.length > 0);
    }
    
    if (activeTab === 'My List') {
      const allAdded = [];
      const seenTitles = new Set();
      for (const row of movieRows) {
        for (const m of row.movies) {
          if (m.isAdded) {
            const titleKey = m.title.toLowerCase().trim();
            if (!seenTitles.has(titleKey)) {
              seenTitles.add(titleKey);
              allAdded.push(m);
            }
          }
        }
      }
      return [
        {
          id: 'my-list-row',
          title: 'My List',
          movies: allAdded
        }
      ];
    }

    // 3. Home / Default (show all categories)
    return movieRows;
  };

  const filteredRows = getFilteredRows();

  return (
    <div className="homepage-container">
      {/* Dynamic Sticky Header with search and tab events */}
      <Navbar 
        onLogout={onLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Large Cinematic Hero Banner (Only shown in Home/TV Shows/Movies and when search is inactive) */}
      {searchQuery.trim() === '' && activeTab !== 'My List' && (
        <HeroBanner onPlayClick={handlePlayClick} />
      )}

      <main 
        className="rows-container" 
        style={{ 
          paddingTop: searchQuery.trim() !== '' || activeTab === 'My List' ? '120px' : '0',
          marginTop: searchQuery.trim() !== '' || activeTab === 'My List' ? '0' : '-80px'
        }}
      >
        {filteredRows.length === 0 || (filteredRows.length === 1 && filteredRows[0].movies.length === 0) ? (
          <div style={{ padding: '80px 4%', textAlign: 'center', color: 'var(--netflix-light-grey)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#fff' }}>No matches found</h2>
            <p>Try searching for a different title, genre, or check your list items!</p>
          </div>
        ) : (
          filteredRows.map((row) => (
            <MovieRow 
              key={row.id} 
              row={row} 
              onPlayClick={handlePlayClick} 
              onToggleMyList={toggleMyList} 
            />
          ))
        )}
      </main>

      {/* Styled Netflix Footer */}
      <Footer />

      {/* --- Premium Interactive Streaming Player Modal --- */}
      <StreamingModal 
        activeStream={activeStream} 
        onClose={handleCloseStream} 
        onEpisodeSelect={handleEpisodeSelect} 
        onSeasonSelect={handleSeasonSelect}
        TV_EPISODES={TV_EPISODES}
      />
    </div>
  );
}

export default Homepage;
