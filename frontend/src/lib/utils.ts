export function formatVistas(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}