const PROFILE_KEY = '@deefy-listening-profile'

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function readProfile() {
  if (typeof window === 'undefined') {
    return { styles: {}, artists: {}, total: 0 }
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    const parsed = raw ? JSON.parse(raw) : null

    return {
      styles: parsed?.styles || {},
      artists: parsed?.artists || {},
      total: Number(parsed?.total) || 0,
    }
  } catch {
    return { styles: {}, artists: {}, total: 0 }
  }
}

function writeProfile(profile) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.warn('Nao foi possivel salvar recomendacoes locais.', error)
  }
}

function getStyle(track) {
  return track?.genre || track?.genero || track?.album || track?.style || ''
}

function getArtist(track) {
  return track?.artist || track?.artistName || track?.artista || track?.name || ''
}

export function recordListeningSignal(track, weight = 3) {
  const styleKey = normalizeKey(getStyle(track))
  const artistKey = normalizeKey(getArtist(track))

  if (!styleKey && !artistKey) return

  const profile = readProfile()

  if (styleKey) {
    profile.styles[styleKey] = (profile.styles[styleKey] || 0) + weight
  }

  if (artistKey) {
    profile.artists[artistKey] = (profile.artists[artistKey] || 0) + Math.max(1, weight - 1)
  }

  profile.total += weight
  profile.updatedAt = new Date().toISOString()
  writeProfile(profile)
}

function itemSignals(item) {
  const tracks = Array.isArray(item?.tracks) ? item.tracks : []
  const styleValues = [
    item?.title,
    item?.name,
    item?.nome,
    item?.genre,
    item?.genero,
    item?.style,
    item?.estilo,
    item?.album,
    ...tracks.map(getStyle),
  ]
  const artistValues = [
    item?.artist,
    item?.artistName,
    item?.artista,
    item?.name,
    item?.nome,
    ...tracks.map(getArtist),
  ]

  return {
    styles: styleValues.map(normalizeKey).filter(Boolean),
    artists: artistValues.map(normalizeKey).filter(Boolean),
  }
}

export function getRecommendationScore(item, profile = readProfile()) {
  const signals = itemSignals(item)
  const styleScore = signals.styles.reduce((score, key) => score + (profile.styles[key] || 0), 0)
  const artistScore = signals.artists.reduce((score, key) => score + (profile.artists[key] || 0), 0)

  return 1 + styleScore * 2 + artistScore
}

export function rankRecommendations(items = []) {
  const profile = readProfile()

  return [...items].sort((a, b) => {
    const scoreDiff = getRecommendationScore(b, profile) - getRecommendationScore(a, profile)
    if (scoreDiff !== 0) return scoreDiff

    const left = String(a?.title || a?.name || a?.nome || '')
    const right = String(b?.title || b?.name || b?.nome || '')
    return left.localeCompare(right, 'pt-BR')
  })
}

export function pickWeightedRecommendations(items = [], limit = items.length) {
  const profile = readProfile()
  const pool = items
    .filter(Boolean)
    .map((item) => ({
      item,
      weight: Math.max(getRecommendationScore(item, profile), 1),
    }))

  const picks = []
  const maxItems = Math.min(limit, pool.length)

  while (picks.length < maxItems && pool.length > 0) {
    const totalWeight = pool.reduce((total, entry) => total + entry.weight, 0)
    let cursor = Math.random() * totalWeight
    const selectedIndex = pool.findIndex((entry) => {
      cursor -= entry.weight
      return cursor <= 0
    })
    const safeIndex = selectedIndex >= 0 ? selectedIndex : pool.length - 1
    const [selected] = pool.splice(safeIndex, 1)
    picks.push(selected.item)
  }

  return picks
}

export function getListeningProfile() {
  return readProfile()
}
