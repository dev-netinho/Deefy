import { useState, useEffect } from "react";
import { musicService } from "../services/musicService";
import {
  filterBySearch,
  getSearchableText,
  sanitizeSearchQuery,
} from "../utils/search";

const SEARCH_SCOPES = {
  all: ["songs", "genres", "albums", "artists", "playlists"],
  songs: ["songs"],
  genres: ["genres"],
  albums: ["albums"],
  artists: ["artists"],
  playlists: ["playlists"],
};

function firstText(...values) {
  const value = values.find((item) => (
    (typeof item === "string" && item.trim()) ||
    typeof item === "number"
  ));
  return value === undefined || value === null ? "" : String(value).trim();
}

function getPlaylistSearchText(playlist) {
  return getSearchableText(
    playlist?.name,
    playlist?.nome,
    playlist?.title,
    playlist?.titulo,
    playlist?.description,
    playlist?.descricao,
    playlist?.genre,
    playlist?.genero,
  );
}

function getArtistSearchText(artist) {
  return getSearchableText(
    artist?.name,
    artist?.nome,
    artist?.artistName,
    artist?.artistaNome,
    artist?.title,
    artist?.genre,
    artist?.genero,
    artist?.style,
    artist?.estilo,
    artist?.bio,
    artist?.description,
  );
}

function dedupeByIdentity(items, fallbackPrefix) {
  const map = new Map();

  items.forEach((item, index) => {
    if (!item) return;
    const key = firstText(item.id, item.uuid, item.slug, item.name, item.nome, item.title) || `${fallbackPrefix}-${index}`;
    if (!map.has(String(key))) {
      map.set(String(key), item);
    }
  });

  return Array.from(map.values());
}

/**
 * Searches the catalog via the backend API and local catalog filtering.
 *
 * @param {string} rawQuery - Raw string from the search input
 * @param {string} scope - Search scope: all, songs, genres, albums, artists, playlists
 */
export function useMusicSearch(rawQuery, scope = "all") {
  const [songResults, setSongResults] = useState([]);
  const [artistResults, setArtistResults] = useState([]);
  const [playlistResults, setPlaylistResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const sanitizedQuery = sanitizeSearchQuery(rawQuery);

  useEffect(() => {
    if (!sanitizedQuery) {
      // Reset via dedicated effect to avoid calling setState
      // synchronously inside the effect (react-hooks/set-state-in-effect).
      return;
    }

    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) {
        setIsLoading(true);
      }
    });
    const activeScopes = SEARCH_SCOPES[scope] || SEARCH_SCOPES.all;
    const shouldSearchSongs = activeScopes.includes("songs");
    const shouldSearchGenres = activeScopes.includes("genres");
    const shouldSearchAlbums = activeScopes.includes("albums");
    const shouldSearchArtists = activeScopes.includes("artists");
    const shouldSearchPlaylists = activeScopes.includes("playlists");
    const musicSearchFields = [
      ...(shouldSearchSongs ? ["title", "artist"] : []),
      ...(shouldSearchAlbums ? ["album"] : []),
      ...(shouldSearchGenres ? ["genre"] : []),
    ];

    const musicSearchPromise = musicSearchFields.length
      ? musicService.searchMusicsSmart(sanitizedQuery, { fields: musicSearchFields })
      : Promise.resolve([]);

    const artistSearchPromise = shouldSearchArtists
      ? musicService.getArtists().then((artists) => (
        filterBySearch(dedupeByIdentity(artists, "artist"), sanitizedQuery, getArtistSearchText)
      ))
      : Promise.resolve([]);

    const playlistSearchPromise = shouldSearchPlaylists
      ? Promise.allSettled([
        musicService.getGlobalPlaylists(),
        musicService.getUserPlaylists(),
      ]).then((playlistResponses) => {
        const playlists = [];
        playlistResponses.forEach((result, responseIndex) => {
          if (result.status === "fulfilled" && Array.isArray(result.value)) {
            const source = responseIndex === 0 ? "global" : "user";
            playlists.push(...result.value.map((playlist) => ({
              ...playlist,
              __searchSource: source,
            })));
          }
        });

        return filterBySearch(dedupeByIdentity(playlists, "playlist"), sanitizedQuery, getPlaylistSearchText);
      })
      : Promise.resolve([]);

    Promise.allSettled([musicSearchPromise, artistSearchPromise, playlistSearchPromise])
      .then(([musicResult, artistResult, playlistResult]) => {
        if (!isMounted) return;

        const nextSongs = musicResult.status === "fulfilled" ? musicResult.value : [];
        const nextArtists = artistResult.status === "fulfilled" ? artistResult.value : [];
        const nextPlaylists = playlistResult.status === "fulfilled" ? playlistResult.value : [];

        setSongResults(nextSongs);
        setArtistResults(nextArtists);
        setPlaylistResults(nextPlaylists);
        setIsEmpty(nextSongs.length === 0 && nextArtists.length === 0 && nextPlaylists.length === 0);
      })
      .catch(() => {
        if (isMounted) {
          setSongResults([]);
          setArtistResults([]);
          setPlaylistResults([]);
          setIsEmpty(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [scope, sanitizedQuery]);

  // When there is no query, return stable empty values without triggering setState.
  if (!sanitizedQuery) {
    return {
      sanitizedQuery,
      results: [],
      songResults: [],
      artistResults: [],
      playlistResults: [],
      isEmpty: false,
      isLoading: false,
    };
  }

  return {
    sanitizedQuery,
    results: songResults,
    songResults,
    artistResults,
    playlistResults,
    isEmpty,
    isLoading,
  };
}
