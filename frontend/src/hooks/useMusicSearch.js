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
      return;
    }

    let isMounted = true;

    Promise.resolve()
      .then(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      })
      .then(() =>
        musicService
          .searchMusicsByTitle(sanitizedQuery)
          .then((data) => {
            if (isMounted) {
              setResults(data);
              setIsEmpty(data.length === 0);
            }
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
          })
      );

    return () => {
      isMounted = false;
    };
  }, [sanitizedQuery]);

  return {
    sanitizedQuery,
    results: sanitizedQuery ? results : [],
    isEmpty: sanitizedQuery ? isEmpty : false,
    isLoading: sanitizedQuery ? isLoading : false,
  };
}
