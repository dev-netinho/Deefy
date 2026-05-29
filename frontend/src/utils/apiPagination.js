export function getListFromApiResponse(data) {
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

function getTotalPagesFromResponse(data) {
  const totalPages = Number(data?.totalPages);
  return Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
}

export async function fetchAllPages(apiClient, path, { size = 100, params = {}, getItems = getListFromApiResponse } = {}) {
  const firstResponse = await apiClient.get(path, {
    params: { ...params, page: 0, size },
  });
  const firstPage = getItems(firstResponse.data);
  const totalPages = getTotalPagesFromResponse(firstResponse.data);

  if (totalPages <= 1 || Array.isArray(firstResponse.data)) {
    return firstPage;
  }

  const remainingResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => (
      apiClient.get(path, {
        params: { ...params, page: index + 1, size },
      })
    ))
  );

  return remainingResponses.reduce((items, response) => (
    items.concat(getItems(response.data))
  ), firstPage);
}
