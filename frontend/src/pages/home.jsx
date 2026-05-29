import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaChevronRight, FaCompactDisc, FaListUl, FaMicrophoneAlt, FaMusic, FaPlay, FaUserAlt } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import SongListSkeleton from "../components/SongListSkeleton";
import EmptyState from "../components/EmptyState";
import { useMusicSearch } from "../hooks/useMusicSearch";
import { useDebounce } from "../hooks/useDebounce";
import { musicService } from "../services/musicService";
import { pickWeightedRecommendations, rankRecommendations } from "../utils/recommendationEngine";
import "./home.css";

const searchTypes = [
  { id: "all", label: "Tudo", icon: <FaMusic aria-hidden="true" /> },
  { id: "songs", label: "Músicas", icon: <FaPlay aria-hidden="true" /> },
  { id: "genres", label: "Gêneros", icon: <FaCompactDisc aria-hidden="true" /> },
  { id: "albums", label: "Álbuns", icon: <FaCompactDisc aria-hidden="true" /> },
  { id: "artists", label: "Artistas", icon: <FaUserAlt aria-hidden="true" /> },
  { id: "playlists", label: "Playlists", icon: <FaListUl aria-hidden="true" /> },
];

function firstText(...values) {
  return values.find((value) => typeof value === "string" && value.trim())?.trim() || "";
}

function getPlaylistTitle(playlist) {
  return firstText(
    playlist?.name,
    playlist?.nome,
    playlist?.title,
    playlist?.titulo,
    "Playlist recomendada"
  );
}

function getPlaylistId(playlist) {
  return playlist?.id || playlist?.uuid || playlist?.playlistId || playlist?.codigo || "";
}

function getTrackCover(track) {
  return firstText(
    track?.coverUrl,
    track?.capaUrl,
    track?.imageUrl,
    track?.imagemUrl,
    track?.thumbnailUrl,
    track?.albumCover
  );
}

function getPlaylistCover(playlist) {
  return firstText(
    playlist?.coverUrl,
    playlist?.capaUrl,
    playlist?.imageUrl,
    playlist?.imagemUrl,
    playlist?.thumbnailUrl,
    playlist?.tracks?.map(getTrackCover).find(Boolean)
  );
}

function getArtistName(artist) {
  return firstText(
    artist?.name,
    artist?.nome,
    artist?.artistName,
    artist?.artistaNome,
    artist?.title,
    "Artista"
  );
}

function getArtistImage(artist) {
  return firstText(
    artist?.imageUrl,
    artist?.imagemUrl,
    artist?.photoUrl,
    artist?.fotoUrl,
    artist?.avatarUrl,
    artist?.coverUrl
  );
}

function getArtistMeta(artist) {
  return firstText(
    artist?.genre,
    artist?.genero,
    artist?.style,
    artist?.estilo,
    artist?.bio,
    artist?.description,
    "Informação não cadastrada"
  );
}

function SearchTypeFilters({ activeType, onChange }) {
  return (
    <div className="home-search-types" role="tablist" aria-label="Tipo de pesquisa">
      {searchTypes.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeType === id}
          className={`home-search-type${activeType === id ? " is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function PlaylistSearchResults({ playlists }) {
  if (!playlists.length) return null;

  return (
    <section className="home-search-section">
      <div className="home-search-section-heading">
        <span>PLAYLISTS</span>
        <h2>Playlists encontradas</h2>
      </div>

      <div className="home-search-card-grid">
        {playlists.map((playlist, index) => {
          const playlistId = getPlaylistId(playlist);
          const routeBase = playlist.__searchSource === "user" ? "/user-playlist-detail" : "/playlist-detail";
          const href = playlistId ? `${routeBase}/${playlistId}` : "/system-playlists";

          return (
            <Link
              key={playlistId || `${getPlaylistTitle(playlist)}-${index}`}
              className="home-search-card home-search-card--playlist"
              to={href}
              style={getPlaylistCover(playlist) ? { backgroundImage: `url(${getPlaylistCover(playlist)})` } : undefined}
            >
              <span className="home-search-card-badge">Playlist</span>
              <h3>{getPlaylistTitle(playlist)}</h3>
              <p>{getPlaylistSubtitle(playlist)}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ArtistSearchResults({ artists }) {
  if (!artists.length) return null;

  return (
    <section className="home-search-section">
      <div className="home-search-section-heading">
        <span>ARTISTAS</span>
        <h2>Artistas encontrados</h2>
      </div>

      <div className="home-search-card-grid">
        {artists.map((artist, index) => {
          const artistName = getArtistName(artist);
          const artistHref = artistName && artistName !== "Artista"
            ? `/artists?focus=${encodeURIComponent(artistName)}`
            : "/artists";

          return (
            <Link
              key={artist?.id || artist?.uuid || `${artistName}-${index}`}
              className="home-search-card home-search-card--artist"
              to={artistHref}
              style={getArtistImage(artist) ? { backgroundImage: `url(${getArtistImage(artist)})` } : undefined}
            >
              <span className="home-search-card-badge">Artista</span>
              <h3>{artistName}</h3>
              <p>{getArtistMeta(artist)}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ShowcaseSkeleton() {
  return (
    <div className="home-feature-skeleton-grid" aria-hidden="true">
      <div className="home-feature-skeleton home-feature-skeleton--wide" />
      <div className="home-feature-skeleton" />
    </div>
  );
}

function getPlaylistSubtitle(playlist) {
  const trackCount = playlist?.tracks?.length || playlist?.musics?.length || playlist?.musicas?.length || 0;

  return firstText(
    playlist?.description,
    playlist?.descricao,
    trackCount ? `${trackCount} músicas escolhidas pelo seu gosto.` : ""
  );
}

function HomeFeatureSection({ playlists, artists }) {
  const featuredPlaylist = rankRecommendations(playlists)[0];
  const featuredArtist = rankRecommendations(artists)[0];
  const featuredPlaylistId = featuredPlaylist?.id || featuredPlaylist?.uuid || "";
  const artistName = getArtistName(featuredArtist);
  const artistImage = getArtistImage(featuredArtist);
  const playlistCover = getPlaylistCover(featuredPlaylist);
  const playlistHref = featuredPlaylistId
    ? `/playlist-detail/${featuredPlaylistId}`
    : "/system-playlists";
  const allPlaylistsHref = featuredPlaylistId
    ? `/system-playlists?highlight=${encodeURIComponent(featuredPlaylistId)}`
    : "/system-playlists";
  const artistHref = artistName && artistName !== "Artista"
    ? `/artists?focus=${encodeURIComponent(artistName)}`
    : "/artists";

  return (
    <section className="home-feature-section">
      <div className="home-feature-heading">
        <div>
          <span>CRIADO PARA VOCÊ</span>
          <h2>Descobertas Deefy</h2>
        </div>

      </div>

      <div className="home-feature-grid">
        {featuredPlaylist && (
          <article
            className="home-feature-card home-feature-card--playlists"
            style={playlistCover ? { backgroundImage: `url(${playlistCover})` } : undefined}
          >
            <Link className="home-feature-card-all-link" to={allPlaylistsHref}>
              <span>Ver todas</span>
              <FaChevronRight />
            </Link>

            <Link
              className="home-feature-card-panel"
              to={playlistHref}
              aria-label={`Abrir playlist ${getPlaylistTitle(featuredPlaylist)}`}
            >
              <span className="home-feature-pill">Playlist recomendada</span>
              <h3>{getPlaylistTitle(featuredPlaylist)}</h3>
              <p>{getPlaylistSubtitle(featuredPlaylist)}</p>

              <span className="home-feature-action">
                <FaPlay />
                <span>Explorar</span>
              </span>
            </Link>
          </article>
        )}

        {featuredArtist && (
          <Link
            className="home-feature-card home-feature-card--artists"
            to={artistHref}
            style={artistImage ? { backgroundImage: `url(${artistImage})` } : undefined}
          >
            <span className="home-feature-floating-icon">
              <FaMicrophoneAlt />
            </span>

            <div className="home-feature-card-copy">
              <span>Artistas</span>
              <h3>{artistName}</h3>
              <p>{getArtistMeta(featuredArtist)}</p>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rawQuery, setRawQuery] = useState(() => searchParams.get("artist") || searchParams.get("genre") || "");
  const [homeMusics, setHomeMusics] = useState([]);
  const [recommendedPlaylists, setRecommendedPlaylists] = useState([]);
  const [recommendedArtists, setRecommendedArtists] = useState([]);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const [activeSearchType, setActiveSearchType] = useState(() => (searchParams.has("genre") ? "genres" : "all"));
  const [hasSearchFocus, setHasSearchFocus] = useState(false);

  // Debounce the input to avoid recalculating or hitting an API on every keystroke
  // Waits 300ms after the user stops typing
  const debouncedQuery = useDebounce(rawQuery, 300);

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      musicService.getHomeMusics(32),
      musicService.getGlobalPlaylists(),
      musicService.getArtists(),
    ])
      .then(([musicResult, playlistResult, artistResult]) => {
        if (!isMounted) return;

        if (musicResult.status === "fulfilled") {
          setHomeMusics(pickWeightedRecommendations(musicResult.value, 16));
        }

        if (playlistResult.status === "fulfilled") {
          setRecommendedPlaylists(pickWeightedRecommendations(playlistResult.value, 6));
        }

        if (artistResult.status === "fulfilled") {
          setRecommendedArtists(pickWeightedRecommendations(artistResult.value, 8));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingHome(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  const handleSearchChange = (nextValue) => {
    setRawQuery(nextValue);

    if (!nextValue.trim() && (searchParams.has("artist") || searchParams.has("genre"))) {
      setSearchParams({}, { replace: true });
    }
  };

  // Sanitizes the debounced query and returns API results
  const {
    songResults,
    artistResults,
    playlistResults,
    isEmpty,
    isLoading: isSearchingApi,
  } = useMusicSearch(debouncedQuery, activeSearchType);

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
            <SearchBar
              value={rawQuery}
              onChange={handleSearchChange}
              onFocus={() => setHasSearchFocus(true)}
            />
            {(hasSearchFocus || isSearching) && (
              <SearchTypeFilters
                activeType={activeSearchType}
                onChange={setActiveSearchType}
              />
            )}
          </div>

          {/* ── Default state (no query) ── */}
          {!isSearching && (
            <>
              {isLoadingHome ? (
                <>
                  <ShowcaseSkeleton />
                  <SongListSkeleton count={10} />
                </>
              ) : (
                <>
                  {(recommendedPlaylists.length > 0 || recommendedArtists.length > 0) && (
                    <HomeFeatureSection
                      playlists={recommendedPlaylists}
                      artists={recommendedArtists}
                    />
                  )}

                  <SongList songs={homeMusics} title="Músicas para você" />
                </>
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
                    <>
                      {songResults.length > 0 && (
                        <SongList
                          songs={songResults}
                          title={`Músicas para "${rawQuery.trim()}"`}
                        />
                      )}

                      <PlaylistSearchResults playlists={playlistResults} />
                      <ArtistSearchResults artists={artistResults} />
                    </>
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
