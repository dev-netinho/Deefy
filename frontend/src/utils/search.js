export function sanitizeSearchQuery(raw) {
  if (!raw) return '';

  return String(raw)
    .replace(/[<>"'`]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function normalizeSearchText(value) {
  return sanitizeSearchQuery(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function compactSearchText(value) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

export function getSearchableText(...values) {
  return values
    .flatMap((value) => {
      if (Array.isArray(value)) return value.map((item) => getSearchableText(item));
      if (value === undefined || value === null) return [];
      if (typeof value === 'object') {
        return [
          value.name,
          value.nome,
          value.title,
          value.titulo,
          value.artistName,
          value.artistaNome,
        ];
      }
      return String(value);
    })
    .filter(Boolean)
    .join(' ');
}

function uniqueTokens(value) {
  return [...new Set(normalizeSearchText(value).split(' ').filter(Boolean))];
}

function levenshteinWithin(left, right, maxDistance) {
  if (Math.abs(left.length - right.length) > maxDistance) return false;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array(right.length + 1);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;
    let bestInRow = current[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
      bestInRow = Math.min(bestInRow, current[rightIndex]);
    }

    if (bestInRow > maxDistance) return false;

    for (let index = 0; index < previous.length; index += 1) {
      previous[index] = current[index];
    }
  }

  return previous[right.length] <= maxDistance;
}

function tokenMatches(queryToken, targetTokens) {
  if (!queryToken) return true;

  return targetTokens.some((targetToken) => {
    if (!targetToken) return false;
    if (targetToken.includes(queryToken)) return true;
    if (queryToken.length < 4 || targetToken.length < 4) return false;

    const maxDistance = queryToken.length >= 7 ? 2 : 1;
    return levenshteinWithin(queryToken, targetToken, maxDistance);
  });
}

export function scoreSearchMatch(target, rawQuery) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return 1;

  const normalizedTarget = normalizeSearchText(target);
  if (!normalizedTarget) return 0;
  if (normalizedTarget === query) return 100;
  if (normalizedTarget.startsWith(query)) return 90;
  if (normalizedTarget.includes(query)) return 80;

  const compactTarget = compactSearchText(target);
  const compactQuery = compactSearchText(rawQuery);
  if (compactQuery && compactTarget.includes(compactQuery)) return 75;

  const queryTokens = uniqueTokens(rawQuery);
  const targetTokens = uniqueTokens(target);
  if (queryTokens.length && queryTokens.every((token) => tokenMatches(token, targetTokens))) {
    return 60;
  }

  return 0;
}

export function matchesSearchText(target, rawQuery) {
  return scoreSearchMatch(target, rawQuery) > 0;
}

export function filterBySearch(items, rawQuery, getText = (item) => item) {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) return items;

  return items.filter((item) => matchesSearchText(getText(item), query));
}

export function sortBySearchScore(items, rawQuery, getText = (item) => item) {
  const query = sanitizeSearchQuery(rawQuery);
  if (!query) return items;

  return [...items].sort((left, right) => (
    scoreSearchMatch(getText(right), query) - scoreSearchMatch(getText(left), query)
  ));
}
