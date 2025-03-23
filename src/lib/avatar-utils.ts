export const getAvatarName = (name?: string | null) => {
  if (!name) {
    name = "unknown";
  }
  return name
    .toUpperCase()
    .split(" ")
    .map((n) => n[0])
    .join("");
};
