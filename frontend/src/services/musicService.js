import api from './api';
import {
  getMusicIdFromTrack,
  getPlaylistTrackItems,
  hasMusicDisplayData,
  normalizeMusic,
  normalizeMusicList,
  normalizePlaylist,
  normalizePlaylistList,
} from '../utils/musicNormalizer.js';

export { normalizeMusic, normalizePlaylist };

function getListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.musics)) return data.musics;
  if (Array.isArray(data?.playlists)) return data.playlists;
  if (Array.isArray(data?.favorites)) return data.favorites;
  if (Array.isArray(data?.favoritos)) return data.favoritos;
  if (Array.isArray(data?.favoriteMusics)) return data.favoriteMusics;
  if (Array.isArray(data?.musicasFavoritas)) return data.musicasFavoritas;
  return [];
}

async function hydrateMusicItems(items) {
  const tracks = await Promise.all(items.map(async (track) => {
    if (hasMusicDisplayData(track)) {
      return normalizeMusic(track);
    }

    const musicId = getMusicIdFromTrack(track);
    if (musicId === undefined || musicId === null || musicId === '') {
      return normalizeMusic(track);
    }

    try {
      const response = await api.get(`/musics/${musicId}`);
      return normalizeMusic(response.data);
    } catch (error) {
      console.warn(`Failed to hydrate music ${musicId}:`, error);
      return normalizeMusic(track);
    }
  }));

  return tracks.filter(Boolean);
}

async function hydratePlaylistTracks(playlist) {
  const rawTracks = getPlaylistTrackItems(playlist);
  const tracks = await hydrateMusicItems(rawTracks);
  const normalizedPlaylist = normalizePlaylist(playlist) || playlist;

  return {
    ...playlist,
    ...normalizedPlaylist,
    tracks,
  };
}

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
      return normalizeMusicList(getListFromResponse(response.data));
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
      return normalizeMusic(response.data);
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
      return normalizeMusicList(getListFromResponse(response.data));
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
      return normalizeMusicList(getListFromResponse(response.data));
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
      return normalizeMusicList(getListFromResponse(response.data));
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
          size: 200
        }
      });
      return normalizeMusicList(getListFromResponse(response.data));
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
        await api.delete(`/favorites/musics/${musicId}`);
      } else {
        await api.post(`/favorites/musics/${musicId}`);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  },

  /**
   * Get all favorite musics for the current user
   * @returns {Promise<Array>} Array of musics
   */
  async getFavoriteMusics() {
    try {
      const response = await api.get('/favorites/musics');
      // The response is an array of FavoriteMusicResponseDTO: { id, favoritadoEm, musica: { ... } }
      // We map it to return just the inner music objects so it works with SongList
      return hydrateMusicItems(getListFromResponse(response.data));
    } catch (error) {
      console.error('Failed to get favorite musics:', error);
      throw error;
    }
  },

  /**
   * Get all playlists for the current user
   * @returns {Promise<Array>} Array of playlists
   */
  async getUserPlaylists() {
    try {
      const response = await api.get('/playlists');
      return normalizePlaylistList(getListFromResponse(response.data));
    } catch (error) {
      console.error('Failed to get user playlists:', error);
      throw error;
    }
  },

  /**
   * Get playlists generated by the system/admin for global discovery.
   * @returns {Promise<Array>} Array of public global playlists
   */
  async getGlobalPlaylists() {
    try {
      const response = await api.get('/playlists/global');
      return normalizePlaylistList(getListFromResponse(response.data));
    } catch (error) {
      console.error('Failed to get global playlists:', error);
      throw error;
    }
  },

  /**
   * Get artists from the catalog
   * @param {number} size
   * @returns {Promise<Array>} Array of artists
   */
  async getArtists(size = 20) {
    try {
      const response = await api.get('/artists', { params: { size } });
      return getListFromResponse(response.data);
    } catch (error) {
      console.error('Failed to get artists:', error);
      throw error;
    }
  },

  /**
   * Get playlist details by ID
   * @param {string|number} id
   * @returns {Promise<Object>} Playlist details including tracks
   */
  async getPlaylistById(id) {
    try {
      const response = await api.get(`/playlists/${id}`);
      return hydratePlaylistTracks(response.data);
    } catch (error) {
      console.error(`Failed to get playlist ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new playlist
   * @param {Object} data - { name, publica, description, descricao, coverUrl, capaUrl }
   * @returns {Promise<Object>} The created playlist
   */
  async createPlaylist(data) {
    try {
      const response = await api.post('/playlists', data);
      return normalizePlaylist(response.data) || response.data;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      throw error;
    }
  },

  /**
   * Update a playlist
   * @param {string|number} id
   * @param {Object} data - { name, publica, description, descricao, coverUrl, capaUrl }
   * @returns {Promise<Object>} The updated playlist
   */
  async updatePlaylist(id, data) {
    try {
      const response = await api.put(`/playlists/${id}`, data);
      return normalizePlaylist(response.data) || response.data;
    } catch (error) {
      console.error(`Failed to update playlist ${id}:`, error);
      throw error;
    }
  },

  /**
   * Upload a playlist cover image.
   * Backend contract prepared by the frontend: POST /storage/image -> { url }
   * @param {File} file
   * @returns {Promise<string>} Public image URL
   */
  async uploadPlaylistCoverImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/storage/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = response.data?.url || response.data?.data?.url || response.data;
      if (!url || typeof url !== 'string') {
        throw new Error('Upload concluído, mas a API não retornou a URL da imagem.');
      }

      return url;
    } catch (error) {
      console.error('Failed to upload playlist cover image:', error);
      throw error;
    }
  },

  /**
   * Delete a playlist
   * @param {string|number} id
   * @returns {Promise<void>}
   */
  async deletePlaylist(id) {
    try {
      await api.delete(`/playlists/${id}`);
    } catch (error) {
      console.error(`Failed to delete playlist ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a music to a playlist
   * @param {string|number} playlistId
   * @param {string|number} musicId
   */
  async addMusicToPlaylist(playlistId, musicId) {
    try {
      const resolvedMusicId = getMusicIdFromTrack(musicId) || musicId;

      if (resolvedMusicId === undefined || resolvedMusicId === null || resolvedMusicId === '') {
        throw new Error('Música inválida para adicionar à playlist');
      }

      const response = await api.post(`/playlists/${playlistId}/tracks/${resolvedMusicId}`);
      return normalizePlaylist(response.data) || response.data;
    } catch (error) {
      console.error(`Failed to add music ${musicId} to playlist ${playlistId}:`, error);
      throw error;
    }
  },

  /**
   * Remove a music from a playlist
   * @param {string|number} playlistId
   * @param {string|number} musicId
   */
  async removeMusicFromPlaylist(playlistId, musicId) {
    try {
      const resolvedMusicId = getMusicIdFromTrack(musicId) || musicId;
      await api.delete(`/playlists/${playlistId}/tracks/${resolvedMusicId}`);
    } catch (error) {
      console.error(`Failed to remove music ${musicId} from playlist ${playlistId}:`, error);
      throw error;
    }
  }
};
