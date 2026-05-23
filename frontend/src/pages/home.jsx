import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import SongListSkeleton from "../components/SongListSkeleton";
import EmptyState from "../components/EmptyState";
import { useMusicSearch } from "../hooks/useMusicSearch";
import { useDebounce } from "../hooks/useDebounce";
import { musicService } from "../services/musicService";
import "./home.css";

function Home() {
  const [rawQuery, setRawQuery] = useState("");
  const [homeMusics, setHomeMusics] = useState([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  
  // Debounce the input to avoid recalculating or hitting an API on every keystroke
  // Waits 300ms after the user stops typing
  const debouncedQuery = useDebounce(rawQuery, 300);

  // Fetch initial home musics
  useEffect(() => {
    let isMounted = true;
    musicService.getHomeMusics(12)
      .then(data => {
        if (isMounted) {
          setHomeMusics(data);
          setIsLoadingHome(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingHome(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Sanitizes the debounced query and returns API results
  const { results, isEmpty, isLoading: isSearchingApi } = useMusicSearch(debouncedQuery);

  // isSearching controls the UI transition. Using rawQuery makes the transition instant
  // when the user types the first letter, whereas the results fetch/filter remains debounced.
  const isSearching = rawQuery.trim().length > 0;

  return (
    <div className="home-layout">
      {/* Fixed sidebar (desktop) / bottom nav (mobile) */}
      <Sidebar />

      {/* Main scrollable area */}
      <div className="home-main">
        {/* Sticky header */}
        <Header />

        <main className="home-content">
          {/* Always-visible search bar */}
          <div className="home-search-wrapper">
            <SearchBar value={rawQuery} onChange={setRawQuery} />
          </div>

          {/* ── Default state (no query) ── */}
          {!isSearching && (
            <>
              {isLoadingHome ? (
                <SongListSkeleton count={12} />
              ) : (
                <SongList songs={homeMusics} title="Músicas" />
              )}
            </>
          )}

          {/* ── Search results ── */}
          {isSearching && (
            <>
              {isSearchingApi ? (
                <SongListSkeleton count={5} />
              ) : (
                <>
                  {!isEmpty && (
                    <SongList
                      songs={results}
                      title={`Resultados para "${rawQuery.trim()}"`}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* ── Empty state ── */}
          {isSearching && !isSearchingApi && isEmpty && <EmptyState query={rawQuery.trim()} />}
        </main>
      </div>
    </div>
  );
}

export default Home;