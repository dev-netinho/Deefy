import { useContext } from "react";
import { PlayerContext } from "./player-context";

export function usePlayer() {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }

  return context;
}
