import lqips from "../constants/lqips.json";

export function getLqipColor(src: string): string | undefined {
  return (lqips as Record<string, string>)[src];
}
