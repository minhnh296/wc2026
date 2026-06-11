export const getPagination = (query: { page?: number; pageSize?: number }) => {
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 200;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  return { skip, take, page, pageSize };
};
