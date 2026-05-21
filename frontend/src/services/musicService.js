import api from './api';

export const musicService = {
  /**
   * Fetch a paginated list of all musics
   * @param {number} size - Number of musics to fetch
   * @returns {Promise<Array>} Array of musics
   */
  async getHomeMusics(size = 12) {
    try {
      const response = await api.get(`/musics?size=${size}&sort=id,desc`);
      return response.data?.content || [];
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
      return response.data?.content || [];
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
      return response.data?.content || [];
    } catch (error) {
      console.error(`Failed to search musics by artist "${artist}":`, error);
      throw error;
    }
  }
};
