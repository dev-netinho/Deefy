import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import FeaturedSection from "../components/FeaturedSection";
import SongList from "../components/SongList";
import EmptyState from "../components/EmptyState";
import { MOCK_SONGS, MOCK_PLAYLISTS } from "../mocks/musicData";
import { useMusicSearch } from "../hooks/useMusicSearch";
import { useDebounce } from "../hooks/useDebounce";
import "./home.css";

function Home() {
  const [rawQuery, setRawQuery] = useState("");

  // Debounce the input to avoid recalculating or hitting an API on every keystroke
  // Waits 300ms after the user stops typing
  const debouncedQuery = useDebounce(rawQuery, 300);

  // Sanitizes the debounced query and returns filtered results
  const { results, isEmpty } = useMusicSearch(MOCK_SONGS, debouncedQuery);

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
              <FeaturedSection playlists={MOCK_PLAYLISTS} />
              <SongList songs={MOCK_SONGS} title="Todas as Músicas" />
            </>
          )}

          {/* ── Search results ── */}
          {isSearching && !isEmpty && (
            <SongList
              songs={results}
              title={`Resultados para "${rawQuery.trim()}"`}
            />
          )}

          {/* ── Empty state ── */}
          {isEmpty && <EmptyState query={rawQuery.trim()} />}
        </main>
      </div>
    </div>
  );
}

export default Home;
