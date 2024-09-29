import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler((event) => {
  const { id } = getQuery(event);
  return {
    id: id,
  };
});
