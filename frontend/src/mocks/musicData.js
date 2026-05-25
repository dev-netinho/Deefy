/**
 * @fileoverview Typed mock data for Deefy.
 * When the real API is ready, simply replace the data-fetching in the
 * hooks/services with the real endpoint — the shape is intentionally aligned
 * with what the backend should return.
 */

/**
 * @typedef {Object} Song
 * @property {string} id
 * @property {string} title
 * @property {string} artist
 * @property {string} album
 * @property {string} duration   - formatted "m:ss"
 * @property {string} coverUrl
 * @property {string} genre
 */

/**
 * @typedef {Object} Playlist
 * @property {string} id
 * @property {string} name
 * @property {string} coverUrl
 * @property {number} songCount
 * @property {string} description
 */

/** @type {Song[]} */
export const MOCK_SONGS = [
  {
    id: "s1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:20",
    coverUrl: "https://picsum.photos/seed/blinding/64/64",
    genre: "Synth-pop",
  },
  {
    id: "s2",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:23",
    coverUrl: "https://picsum.photos/seed/levitating/64/64",
    genre: "Pop",
  },
  {
    id: "s3",
    title: "Save Your Tears",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:35",
    coverUrl: "https://picsum.photos/seed/saveyear/64/64",
    genre: "Synth-pop",
  },
  {
    id: "s4",
    title: "Montero",
    artist: "Lil Nas X",
    album: "Montero",
    duration: "2:17",
    coverUrl: "https://picsum.photos/seed/montero/64/64",
    genre: "Hip-hop",
  },
  {
    id: "s5",
    title: "good 4 u",
    artist: "Olivia Rodrigo",
    album: "SOUR",
    duration: "2:58",
    coverUrl: "https://picsum.photos/seed/good4u/64/64",
    genre: "Pop-punk",
  },
  {
    id: "s6",
    title: "Stay",
    artist: "The Kid LAROI & Justin Bieber",
    album: "Stay",
    duration: "2:21",
    coverUrl: "https://picsum.photos/seed/staylaroi/64/64",
    genre: "Pop",
  },
  {
    id: "s7",
    title: "Peaches",
    artist: "Justin Bieber",
    album: "Justice",
    duration: "3:18",
    coverUrl: "https://picsum.photos/seed/peachesjb/64/64",
    genre: "R&B",
  },
  {
    id: "s8",
    title: "Happier Than Ever",
    artist: "Billie Eilish",
    album: "Happier Than Ever",
    duration: "4:58",
    coverUrl: "https://picsum.photos/seed/happierever/64/64",
    genre: "Alternative",
  },
  {
    id: "s9",
    title: "Industry Baby",
    artist: "Lil Nas X",
    album: "Montero",
    duration: "3:32",
    coverUrl: "https://picsum.photos/seed/industrybaby/64/64",
    genre: "Hip-hop",
  },
  {
    id: "s10",
    title: "Permission to Dance",
    artist: "BTS",
    album: "Butter",
    duration: "3:05",
    coverUrl: "https://picsum.photos/seed/permissionbts/64/64",
    genre: "K-Pop",
  },
  {
    id: "s11",
    title: "Bad Habits",
    artist: "Ed Sheeran",
    album: "=",
    duration: "3:51",
    coverUrl: "https://picsum.photos/seed/badhabits/64/64",
    genre: "Pop",
  },
  {
    id: "s12",
    title: "Heat Waves",
    artist: "Glass Animals",
    album: "Dreamland",
    duration: "3:59",
    coverUrl: "https://picsum.photos/seed/heatwaves/64/64",
    genre: "Indie",
  },
];

/** @type {Playlist[]} */
export const MOCK_PLAYLISTS = [
  {
    id: "p1",
    name: "Workout Hits",
    coverUrl: "https://picsum.photos/seed/workout1/240/240",
    songCount: 24,
    description: "Pump up the energy",
  },
  {
    id: "p2",
    name: "Chill Vibes",
    coverUrl: "https://picsum.photos/seed/chillvibes/240/240",
    songCount: 18,
    description: "Relax and unwind",
  },
  {
    id: "p3",
    name: "Late Night Drive",
    coverUrl: "https://picsum.photos/seed/latenightdr/240/240",
    songCount: 15,
    description: "For those long drives",
  },
  {
    id: "p4",
    name: "Morning Coffee",
    coverUrl: "https://picsum.photos/seed/morningcoffee/240/240",
    songCount: 12,
    description: "A calm start to your day",
  },
  {
    id: "p5",
    name: "Top Charts",
    coverUrl: "https://picsum.photos/seed/topcharts99/240/240",
    songCount: 50,
    description: "What's trending now",
  },
];
