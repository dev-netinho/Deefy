import { useMemo } from "react";

/**
 * Sanitizes a raw user input string to prevent XSS injection.
 * Strips HTML-significant characters so the query can never introduce
 * script tags or event handlers if rendered via dangerouslySetInnerHTML
 * elsewhere in the tree.
 *
 * @param {string} raw
 * @returns {string}
 */
function sanitizeQuery(raw) {
  return raw
    .replace(/[<>"'`]/g, "")   // strip HTML-significant chars
    .replace(/javascript:/gi, "") // strip protocol handlers
    .trim();
}

/**
 * Searches a list of songs by the given query.
 * Matches against title, artist, album, and genre (case-insensitive).
 *
 * @param {import('../mocks/musicData').Song[]} songs - Full song catalogue
 * @param {string} rawQuery - Raw string from the search input
 * @returns {{ sanitizedQuery: string, results: import('../mocks/musicData').Song[], isEmpty: boolean }}
 */
export function useMusicSearch(songs, rawQuery) {
  const sanitizedQuery = sanitizeQuery(rawQuery);

  const results = useMemo(() => {
    if (!sanitizedQuery) return songs;

    const lower = sanitizedQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(lower) ||
        song.artist.toLowerCase().includes(lower) ||
        song.album.toLowerCase().includes(lower) ||
        song.genre.toLowerCase().includes(lower)
    );
  }, [songs, sanitizedQuery]);

  return {
    sanitizedQuery,
    results,
    isEmpty: sanitizedQuery.length > 0 && results.length === 0,
  };
}
