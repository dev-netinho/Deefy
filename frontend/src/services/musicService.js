import api from './api';
import fallbackCover from '../assets/logo.svg';

function normalizeMusic(music) {
  const title = music?.title || music?.titulo || 'Musica sem titulo';
  const artist = music?.artist || music?.artista || 'Artista nao informado';
  const album = music?.album || music?.albumTitle || 'Sem album';
  const fileUrl = music?.fileUrl || music?.arquivoUrl || music?.audioUrl || '';
  const coverUrl = music?.coverUrl || music?.capaUrl || fallbackCover;
  const duration = music?.duration || music?.duracaoFormatada || '--:--';

  return {
    ...music,
    title,
    artist,
    album,
    duration,
    fileUrl,
    audioUrl: fileUrl,
    coverUrl,
  };
}

function normalizeMusicList(payload) {
  return (payload?.content || payload || []).map(normalizeMusic);
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
      return normalizeMusicList(response.data);
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
      return normalizeMusicList(response.data);
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
      return normalizeMusicList(response.data);
    } catch (error) {
      console.error(`Failed to search musics by artist "${artist}":`, error);
      throw error;
    }
  }
};
