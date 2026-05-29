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
import {
  filterBySearch,
  getSearchableText,
  sanitizeSearchQuery,
} from '../utils/search.js';
import { fetchAllPages, getListFromApiResponse } from '../utils/apiPagination.js';

export { normalizeMusic, normalizePlaylist };

export const FAVORITE_MUSIC_CHANGED_EVENT = 'deefy:favorite-music-changed';

function getListFromResponse(data) {
  return getListFromApiResponse(data);
}

function notifyFavoriteMusicChanged(musicId, isFavorite) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent(FAVORITE_MUSIC_CHANGED_EVENT, {
    detail: {
      musicId: musicId === undefined || musicId === null ? '' : String(musicId),
      isFavorite: Boolean(isFavorite),
    },
  }));
}

function toPlaylistPayload(data = {}) {
  const name = firstValue(data.name, data.nome, data.title, data.titulo);
  const description = firstValue(data.description, data.descricao, data.bio);
  const coverUrl = firstValue(data.coverUrl, data.capaUrl, data.capaurl, data.imageUrl);
  const isPublic = firstValue(data.publica, data.public, data.isPublic);

  return {
    name: typeof name === 'string' ? name.trim() : name,
    publica: Boolean(isPublic),
    description: typeof description === 'string' ? description.trim() : (description || ''),
    coverUrl: typeof coverUrl === 'string' ? coverUrl.trim() : (coverUrl || ''),
  };
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

let musicCatalogCache = null;
let musicCatalogSize = 0;
let musicCatalogPromise = null;

function dedupeByIdentity(items, fallbackPrefix) {
  const map = new Map();

  items.forEach((item, index) => {
    if (!item) return;
    const key = firstValue(item.id, item.uuid, item.slug, item.title, item.titulo, item.name, item.nome)
      || `${fallbackPrefix}-${index}`;
    if (!map.has(String(key))) {
      map.set(String(key), item);
    }
  });

  return Array.from(map.values());
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function getMusicSearchText(music, fields = ['title', 'artist', 'album', 'genre']) {
  const values = [];

  if (fields.includes('title')) {
    values.push(music?.title, music?.titulo, music?.name, music?.nome);
  }

  if (fields.includes('artist')) {
    values.push(
      music?.artist,
      music?.artista,
      music?.artistName,
      music?.artistaNome,
      music?.artists,
      music?.artistas,
    );
  }

  if (fields.includes('album')) {
    values.push(music?.album, music?.albumName, music?.albumTitle, music?.disco);
  }

  if (fields.includes('genre')) {
    values.push(music?.genre, music?.genero, music?.genreName, music?.generoNome, music?.style, music?.estilo);
  }

  return getSearchableText(...values);
}

function getFallbackSearchRequests(service, query, fields) {
  const requests = [];

  if (fields.includes('title')) {
    requests.push(service.searchMusicsByTitle(query));
  }

  if (fields.includes('artist')) {
    requests.push(service.searchMusicsByArtist(query));
  }

  if (fields.includes('album')) {
    requests.push(service.searchMusicsByAlbum(query));
  }

  if (fields.includes('genre')) {
    requests.push(service.searchMusicsByGenre(query));
  }

  return requests;
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

  async getCatalogMusics(size = 400) {
    if (musicCatalogCache && musicCatalogSize >= size) {
      return musicCatalogCache;
    }

    if (!musicCatalogPromise || musicCatalogSize < size) {
      musicCatalogSize = size;
      musicCatalogPromise = api.get('/musics', { params: { size } })
        .then((response) => {
          musicCatalogCache = normalizeMusicList(getListFromResponse(response.data));
          return musicCatalogCache;
        })
        .catch((error) => {
          musicCatalogPromise = null;
          console.error('Failed to fetch music catalog:', error);
          throw error;
        });
    }

    return musicCatalogPromise;
  },

  clearMusicCatalogCache() {
    musicCatalogCache = null;
    musicCatalogSize = 0;
    musicCatalogPromise = null;
  },

  async searchCatalogMusics(query, options = {}) {
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (!sanitizedQuery) return [];

    const fields = options.fields || ['title', 'artist', 'album', 'genre'];
    const catalog = await this.getCatalogMusics(options.size || 400);
    return filterBySearch(catalog, sanitizedQuery, (music) => getMusicSearchText(music, fields));
  },

  async searchMusicsSmart(query, options = {}) {
    const sanitizedQuery = sanitizeSearchQuery(query);
    if (!sanitizedQuery) return [];

    const fields = options.fields || ['title', 'artist', 'album', 'genre'];

    try {
      return await this.searchCatalogMusics(sanitizedQuery, { ...options, fields });
    } catch {
      const requests = getFallbackSearchRequests(this, sanitizedQuery, fields);
      if (!requests.length) return [];

      const results = await Promise.allSettled(requests);
      return dedupeByIdentity(
        results
          .filter((result) => result.status === 'fulfilled' && Array.isArray(result.value))
          .flatMap((result) => result.value),
        'music',
      );
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
      this.clearMusicCatalogCache();
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
          size: 20
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
        notifyFavoriteMusicChanged(musicId, false);
        return false;
      } else {
        await api.post(`/favorites/musics/${musicId}`);
        notifyFavoriteMusicChanged(musicId, true);
        return true;
      }
    } catch (error) {
      const status = error?.status || error?.response?.status;

      if (!isCurrentlyFavorite && status === 409) {
        notifyFavoriteMusicChanged(musicId, true);
        return true;
      }

      if (isCurrentlyFavorite && status === 404) {
        notifyFavoriteMusicChanged(musicId, false);
        return false;
      }

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
   * Get global/system playlists recommended by Deefy
   * @returns {Promise<Array>} Array of playlists
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
  async getArtists(size = 100) {
    try {
      return fetchAllPages(api, '/artists', { size });
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
      try {
        const directResponse = await api.get(`/playlists/${id}`);
        return hydratePlaylistTracks(directResponse.data);
      } catch (directError) {
        console.warn(`Failed direct playlist lookup ${id}, trying lists:`, directError);
      }

      const [userResponse, globalResponse] = await Promise.allSettled([
        api.get('/playlists'),
        api.get('/playlists/global'),
      ]);
      const playlists = [
        ...(userResponse.status === 'fulfilled' ? getListFromResponse(userResponse.value.data) : []),
        ...(globalResponse.status === 'fulfilled' ? getListFromResponse(globalResponse.value.data) : []),
      ];
      const playlist = playlists.find(p => String(p.id) === String(id));

      if (!playlist) throw new Error('Playlist não encontrada');
      return hydratePlaylistTracks(playlist);
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
      const response = await api.post('/playlists', toPlaylistPayload(data));
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
      const response = await api.put(`/playlists/${id}`, toPlaylistPayload(data));
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
