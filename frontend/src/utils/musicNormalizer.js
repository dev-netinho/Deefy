const API_BASE_URL = (import.meta.env.VITE_API_URL || window.location.origin)
  .replace(/\/api\/v1\/?$/, '')
  .replace(/\/$/, '')

const MUSIC_WRAPPER_KEYS = [
  'musica',
  'music',
  'song',
  'track',
  'faixa',
  'musicaDTO',
  'musicDTO',
  'songDTO',
  'trackDTO',
  'musicaResponse',
  'musicResponse',
  'musicaResponseDTO',
  'musicResponseDTO',
]

const PLAYLIST_TRACK_KEYS = ['tracks', 'musics', 'musicas', 'songs', 'faixas']

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function getObjectName(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(getObjectName).filter(Boolean).join(', ')
  }
  if (typeof value === 'object') {
    return firstValue(value.name, value.nome, value.title, value.titulo) || ''
  }
  return ''
}

export function parseDuration(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return 0

  const parts = value.split(':').map((part) => Number(part))
  if (parts.some((part) => !Number.isFinite(part))) return 0

  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function resolveMediaUrl(value) {
  if (!value || typeof value !== 'string') return ''
  if (/^(https?:|blob:|data:)/i.test(value)) return value
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`
  return value
}

export function unwrapMusic(value) {
  if (!value || typeof value !== 'object') return null

  for (const key of MUSIC_WRAPPER_KEYS) {
    if (value[key] && typeof value[key] === 'object') {
      return value[key]
    }
  }

  return value
}

export function hasMusicDisplayData(value) {
  const music = unwrapMusic(value)
  if (!music) return false

  return Boolean(
    firstValue(
      music.title,
      music.titulo,
      music.name,
      music.nome,
      music.musicTitle,
      music.nomeMusica,
      music.tituloMusica,
      music.artistName,
      music.artistaNome,
      music.albumName,
      music.coverUrl,
      music.capaUrl,
      music.imageUrl,
      music.audioUrl,
      music.fileUrl
    )
  )
}

export function getMusicIdFromTrack(value) {
  if (!value || typeof value !== 'object') return value

  const wrappedMusicId = firstValue(
    value.musica?.id,
    value.music?.id,
    value.song?.id,
    value.track?.id,
    value.faixa?.id,
    value.musicaDTO?.id,
    value.musicDTO?.id
  )

  const explicitId = firstValue(
    value.musicId,
    value.musicaId,
    value.songId,
    value.trackId,
    value.faixaId,
    value.idMusica,
    value.id_music,
    value.music_id,
    value.musica_id,
    wrappedMusicId
  )

  if (explicitId !== undefined && explicitId !== null && explicitId !== '') {
    return explicitId
  }

  const music = unwrapMusic(value)
  if (hasMusicDisplayData(music)) {
    return firstValue(music.id, music.uuid)
  }

  return null
}

export function getPlaylistTrackItems(playlist) {
  if (!playlist || typeof playlist !== 'object') return []

  for (const key of PLAYLIST_TRACK_KEYS) {
    if (Array.isArray(playlist[key])) return playlist[key]
  }

  return []
}

export function normalizeMusic(value) {
  const music = unwrapMusic(value)
  if (!music || typeof music !== 'object') return null

  const container = value && typeof value === 'object' ? value : {}
  const ownMusicId = hasMusicDisplayData(music) ? firstValue(music.id, music.uuid) : null
  const durationSeconds = firstValue(
    music.durationSeconds,
    music.durationInSeconds,
    music.lengthSeconds,
    music.duracaoSegundos,
    music.tempoSegundos,
    parseDuration(music.duration || music.duracao)
  )

  const album = getObjectName(firstValue(
    music.albumName,
    music.albumTitle,
    music.album,
    music.disco
  ))

  const artist = getObjectName(firstValue(
    music.artistName,
    music.artistaNome,
    music.artist,
    music.artista,
    music.artists,
    music.artistas
  ))

  const normalized = {
    ...music,
    playlistTrackId: container.id !== music.id ? container.id : container.playlistTrackId,
    id: firstValue(
      ownMusicId,
      getMusicIdFromTrack(container),
      getMusicIdFromTrack(music)
    ),
    title: firstValue(
      music.title,
      music.titulo,
      music.name,
      music.nome,
      music.musicTitle,
      music.nomeMusica,
      music.tituloMusica
    ),
    artist,
    album,
    genre: getObjectName(firstValue(
      music.genreName,
      music.generoNome,
      music.genre,
      music.genero,
      music.style,
      music.estilo,
      album
    )),
    coverUrl: resolveMediaUrl(firstValue(
      music.coverUrl,
      music.capaUrl,
      music.imageUrl,
      music.imagemUrl,
      music.thumbnailUrl,
      music.cover,
      music.capa,
      music.albumCover,
      music.album?.coverUrl,
      music.album?.capaUrl
    )),
    audioUrl: resolveMediaUrl(firstValue(
      music.audioUrl,
      music.arquivoUrl,
      music.arquivourl,
      music.fileUrl,
      music.previewUrl,
      music.url,
      music.src,
      music.streamUrl
    )),
    durationSeconds,
  }

  normalized.duration = firstValue(
    music.duration,
    music.duracao,
    formatDuration(durationSeconds)
  )

  return normalized
}

export function normalizeMusicList(items) {
  if (!Array.isArray(items)) return []
  return items.map(normalizeMusic).filter(Boolean)
}

export function normalizePlaylist(playlist) {
  if (!playlist || typeof playlist !== 'object') return null

  return {
    ...playlist,
    description: firstValue(
      playlist.description,
      playlist.descricao,
      playlist.descrição,
      playlist.about,
      playlist.bio,
      ''
    ),
    coverUrl: resolveMediaUrl(firstValue(
      playlist.coverUrl,
      playlist.capaUrl,
      playlist.imageUrl,
      playlist.imagemUrl,
      playlist.cover,
      playlist.capa,
      playlist.thumbnailUrl
    )),
    tracks: normalizeMusicList(getPlaylistTrackItems(playlist)),
  }
}

export function normalizePlaylistList(playlists) {
  if (!Array.isArray(playlists)) return []
  return playlists.map(normalizePlaylist).filter(Boolean)
}
