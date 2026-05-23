import api from './api';

export const musicService = {
  /**
   * Fetch a paginated list of all musics
   * @param {number} size - Number of musics to fetch
   * @returns {Promise<Array>} Array of musics
   */
  async getHomeMusics(size = 12) {
    try {
      // Fetch random musics directly from the backend endpoint
      const response = await api.get(`/musics/random?size=${size}`);
      return response.data?.content || response.data || [];
    } catch (error) {
      console.error('Failed to fetch home musics:', error);
      throw error;
    }
  },

  /**
   * Fetch complete details of a single music by ID
   * @param {string|number} id - The ID of the music
   * @returns {Promise<Object>} The music details
   */
  async getMusicById(id) {
    try {
      const response = await api.get(`/musics/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch music details for id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a new music track (ADMIN only — endpoint must enforce this server-side)
   * @param {Object} musicData - The music fields to send
   * @returns {Promise<Object>} The created music
   */
  async addMusic(musicData) {
    try {
      const response = await api.post('/musics', musicData);
      return response.data;
    } catch (error) {
      console.error('Failed to add music:', error);
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
  },

  /**
   * Search musics by album name
   * @param {string} album - Album name to search for
   * @returns {Promise<Array>} Array of matching musics
   */
  async searchMusicsByAlbum(album) {
    if (!album || album.trim() === '') return [];

    try {
      const response = await api.get(`/musics/search/album`, {
        params: {
          album: album.trim(),
          size: 20
        }
      });
      return response.data?.content || [];
    } catch (error) {
      console.error(`Failed to search musics by album "${album}":`, error);
      throw error;
    }
  },

  /**
   * Search musics by genre
   * @param {string} genre - Genre to search for
   * @returns {Promise<Array>} Array of matching musics
   */
  async searchMusicsByGenre(genre) {
    if (!genre || genre.trim() === '') return [];

    try {
      const response = await api.get(`/musics/search/genre`, {
        params: {
          genre: genre.trim(),
          size: 20
        }
      });
      return response.data?.content || [];
    } catch (error) {
      console.error(`Failed to search musics by genre "${genre}":`, error);
      throw error;
    }
  },

  /**
   * Toggle favorite status of a music for the current user
   * @param {string|number} musicId
   * @param {boolean} isCurrentlyFavorite
   */
  async toggleFavorite(musicId, isCurrentlyFavorite) {
    try {
      if (isCurrentlyFavorite) {
        await api.delete(`/users/me/favorites/${musicId}`);
      } else {
        await api.post(`/users/me/favorites/${musicId}`);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }
};
