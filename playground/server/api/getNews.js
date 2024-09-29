import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler((event) => {
  const { id } = getQuery(event);
  let metadata = null;

  if (id === "1" || id.startsWith("1-")) {
    metadata = {
      en: { id: "1-one" },
      de: { id: "1-eins" },
      ru: { id: "1-odin" },
    };
  }
  if (id === "2" || id.startsWith("2-")) {
    metadata = {
      en: { id: "2-two" },
      de: { id: "2-zwei" },
      ru: { id: "2-dva" },
    };
  }
  return {
    id: id,
    metadata,
  };
});
