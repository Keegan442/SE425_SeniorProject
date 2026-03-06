export function getBudgetColor(
  pct: number,
  colors: any
) {
  if (pct > 0.9) return colors.danger;
  if (pct > 0.7) return '#FFC107';
  return colors.ok;
}