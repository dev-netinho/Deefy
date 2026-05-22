import api from './api';
import fallbackCover from '../assets/logo.svg';

function formatDuration(seconds) {
  const safeSeconds = Number(seconds);

  if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) {
    return '--:--';
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function normalizeMusic(music) {
  const durationSeconds = Number(
    music?.durationSeconds ?? music?.duracaoSegundos ?? music?.duracao
  );
  const genre = music?.genre ?? music?.genero ?? music?.album ?? music?.albumTitle;

  return {
    ...music,
    id: music?.id,
    title: music?.title ?? music?.titulo ?? 'Musica sem titulo',
    artist: music?.artist ?? music?.artista ?? 'Artista nao informado',
    album: genre ?? 'Sem genero',
    genre,
    coverUrl: music?.coverUrl ?? music?.capaUrl ?? fallbackCover,
    fileUrl: music?.fileUrl ?? music?.arquivoUrl ?? '',
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 0,
    duration: music?.duration ?? formatDuration(durationSeconds),
  };
}

function normalizePageContent(data) {
  if (Array.isArray(data)) {
    return data.map(normalizeMusic);
  }

  return (data?.content || []).map(normalizeMusic);
}

export const musicService = {
  /**
   * Fetch a paginated list of all musics
   * @param {number} size - Number of musics to fetch
   * @returns {Promise<Array>} Array of musics
   */
  async getHomeMusics(size = 12) {
    try {
      const response = await api.get(`/musics?size=${size}&sort=id,desc`);
      return normalizePageContent(response.data);
    } catch (error) {
      console.error('Failed to fetch home musics:', error);
      throw error;
    }
  },

  /**
   * Search musics by title
   * @param {string} title - Title to search for
   * @returns {Promise<Array>} Array of matching musics
   */
  async searchMusicsByTitle(title) {
    if (!title || title.trim() === '') return [];
    
    try {
      const response = await api.get(`/musics/search/title`, {
        params: {
          title: title.trim(),
          size: 20
        }
      });
      return normalizePageContent(response.data);
    } catch (error) {
      console.error(`Failed to search musics with title "${title}":`, error);
      throw error;
    }
  },

  /**
   * Search musics by artist name
   * @param {string} artist - Artist name to search for
   * @returns {Promise<Array>} Array of matching musics
   */
  async searchMusicsByArtist(artist) {
    if (!artist || artist.trim() === '') return [];

    try {
      const response = await api.get(`/musics/search/artist`, {
        params: {
          artist: artist.trim(),
          size: 20
        }
      });
      return normalizePageContent(response.data);
    } catch (error) {
      console.error(`Failed to search musics by artist "${artist}":`, error);
      throw error;
    }
  }
};
