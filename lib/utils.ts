import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Class merger for tailwind-merge + clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
