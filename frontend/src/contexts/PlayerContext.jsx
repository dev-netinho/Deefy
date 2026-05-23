// eslint-disable-next-line react-refresh/only-export-components
// Exporting both PlayerProvider and usePlayer from the same file is intentional:
// this is standard React context pattern. The Fast Refresh warning is suppressed here.
import { createContext, useState, useContext } from 'react';


const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);

  const playTrack = (track, newQueue) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }
  };

  const playNext = () => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (!queue.length || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        playTrack,
        playNext,
        playPrevious,
        togglePlay,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
