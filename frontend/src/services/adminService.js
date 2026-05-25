import api from './api';

export const adminService = {

  // ── Genres ────────────────────────────────────────────────
  async getGenres() {
    try {
      const res = await api.get('/genres?size=1000');
      return res.data?.content || res.data || [];
    } catch { return []; }
  },
  async createGenre(data) {
    const res = await api.post('/genres', data);
    return res.data;
  },
  async deleteGenre(id) {
    const res = await api.delete(`/genres/${id}`);
    return res.data;
  },

  // ── Artists ──────────────────────────────────────────────
  async getArtists() {
    try {
      const res = await api.get('/artists?size=1000');
      return res.data?.content || res.data || [];
    } catch { return []; }
  },
  async createArtist(data) {
    const res = await api.post('/artists', data);
    return res.data;
  },

  // ── Albums ────────────────────────────────────────────────
  async getAlbums() {
    try {
      const res = await api.get('/albums?size=100');
      return res.data?.content || res.data || [];
    } catch { return []; }
  },
  async createAlbum(data) {
    const res = await api.post('/albums', data);
    return res.data;
  },

  // ── Musics ────────────────────────────────────────────────
  async getMusics() {
    const res = await api.get('/musics?size=200');
    // Handle: paginated { content: [] }, array [], or { musics: [] }
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.musics)) return data.musics;
    return [];
  },

  async createMusic(data) {
    const res = await api.post('/musics', data);
    return res.data;
  },

  // ── Playlists ─────────────────────────────────────────────
  async getPlaylists() {
    try {
      const res = await api.get('/playlists?size=100');
      return res.data?.content || res.data || [];
    } catch { return []; }
  },
  async createPlaylist(data) {
    const res = await api.post('/playlists', data);
    return res.data;
  },

  // ── Playlist Import (admin) ──────────────────────────────
  async startYoutubePlaylistImport(data) {
    const res = await api.post('/admin/playlist-imports/youtube', data);
    return res.data;
  },
  async getPlaylistImportJob(id) {
    const res = await api.get(`/admin/playlist-imports/${id}`);
    return res.data;
  },
  async getYoutubeCookiesStatus() {
    const res = await api.get('/admin/playlist-imports/youtube-cookies');
    return res.data;
  },
  async saveYoutubeCookies(content) {
    const res = await api.put('/admin/playlist-imports/youtube-cookies', { content });
    return res.data;
  },

  // ── Storage (Uploads) ─────────────────────────────────────
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/storage/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async uploadAudio(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/storage/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // ── Stats ─────────────────────────────────────────────────
  async getStats() {
    const [genres, artists, albums, musics, playlists] = await Promise.allSettled([
      adminService.getGenres(),
      adminService.getArtists(),
      adminService.getAlbums(),
      adminService.getMusics(),
      adminService.getPlaylists(),
    ]);
    return {
      genres:    genres.status    === 'fulfilled' ? genres.value.length    : 0,
      artists:   artists.status   === 'fulfilled' ? artists.value.length   : 0,
      albums:    albums.status    === 'fulfilled' ? albums.value.length    : 0,
      musics:    musics.status    === 'fulfilled' ? musics.value.length    : 0,
      playlists: playlists.status === 'fulfilled' ? playlists.value.length : 0,
    };
  },

  // ── Users (admin) ─────────────────────────────────────────
  /**
   * List all users — requires ROLE_ADMIN on the server.
   * ⚠️ Contains sensitive data (email, status). Only call from admin-guarded routes.
   */
  async getUsers(page = 0, size = 50) {
    try {
      const res = await api.get(`/users?page=${page}&size=${size}&sort=createdAt,desc`);
      return res.data || { content: [], totalPages: 1 };
    } catch { return { content: [], totalPages: 1 }; }
  },

  /** Aggregate user statistics for the dashboard */
  async getUserStats() {
    try {
      const res = await api.get('/users/stats');
      return res.data || {};
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return { total: 0, active: 0, banned: 0, newThisMonth: 0, admins: 0, deleted: 0, offline: 0, online: 0 };
    }
  },

  /** Update user fields (name, email, role, etc.) */
  async updateUser(id, data) {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  /** Permanently delete a user account */
  async deleteUser(id) {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  /**
   * Ban / unban a user.
   * Sends PATCH /users/{id}/ban with { banned: true|false }
   */
  async setBanStatus(id, banned) {
    const res = await api.patch(`/users/${id}/ban`, { banned });
    return res.data;
  },

  /**
   * Change a user's role (promote to admin or demote to regular user).
   * ⚠️ The server must validate that only a super-admin can promote to ROLE_ADMIN.
   */
  async setUserRole(id, role) {
    const res = await api.patch(`/users/${id}/role`, { role });
    return res.data;
  },
};
