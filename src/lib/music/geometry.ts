export const round = (n: number) => Math.round(n * 1000) / 1000;
export const point = (n: number, radius = 185) => ({
  x: round(280 + Math.sin((n * Math.PI) / 6) * radius),
  y: round(280 - Math.cos((n * Math.PI) / 6) * radius),
});
