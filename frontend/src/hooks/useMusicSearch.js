import { useState, useEffect } from "react";
import { musicService } from "../services/musicService";

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
  if (!raw) return "";
  return String(raw)
    .replace(/[<>"'`]/g, "")   // strip HTML-significant chars
    .replace(/javascript:/gi, "") // strip protocol handlers
    .trim();
}

/**
 * Searches songs via the backend API.
 *
 * @param {string} rawQuery - Raw string from the search input
 * @returns {{ sanitizedQuery: string, results: any[], isEmpty: boolean, isLoading: boolean }}
 */
export function useMusicSearch(rawQuery) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const sanitizedQuery = sanitizeQuery(rawQuery);

  useEffect(() => {
    if (!sanitizedQuery) {
      // Reset via dedicated effect to avoid calling setState
      // synchronously inside the effect (react-hooks/set-state-in-effect).
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([
      musicService.searchMusicsByTitle(sanitizedQuery),
      musicService.searchMusicsByArtist(sanitizedQuery),
      musicService.searchMusicsByAlbum(sanitizedQuery),
      musicService.searchMusicsByGenre(sanitizedQuery)
    ])
      .then((resultsArray) => {
        if (!isMounted) return;

        const allResults = [];
        resultsArray.forEach((result) => {
          if (result.status === "fulfilled" && Array.isArray(result.value)) {
            allResults.push(...result.value);
          }
        });

        // Deduplicate by ID
        const uniqueMusicsMap = new Map();
        allResults.forEach(music => {
          if (music && music.id && !uniqueMusicsMap.has(music.id)) {
            uniqueMusicsMap.set(music.id, music);
          }
        });

        const mergedData = Array.from(uniqueMusicsMap.values());
        setResults(mergedData);
        setIsEmpty(mergedData.length === 0);
      })
      .catch(() => {
        if (isMounted) {
          setResults([]);
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
  }, [sanitizedQuery]);

  // When there is no query, return stable empty values without triggering setState.
  if (!sanitizedQuery) {
    return { sanitizedQuery, results: [], isEmpty: false, isLoading: false };
  }

  return {
    sanitizedQuery,
    results,
    isEmpty,
    isLoading,
  };
}

