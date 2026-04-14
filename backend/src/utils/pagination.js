// Devuelve el formato de paginación que espera el frontend
function buildPage(content, totalElements, page, size) {
  const totalPages = Math.ceil(totalElements / size) || 0;
  return {
    content,
    pageable: {
      pageNumber: page,
      pageSize: size,
      sort: { sorted: false, unsorted: true, empty: true },
      offset: page * size,
      paged: true,
      unpaged: false,
    },
    totalElements,
    totalPages,
    last: page >= totalPages - 1,
    first: page === 0,
    size,
    number: page,
    numberOfElements: content.length,
    empty: content.length === 0,
    sort: { sorted: false, unsorted: true, empty: true },
  };
}

module.exports = { buildPage };
