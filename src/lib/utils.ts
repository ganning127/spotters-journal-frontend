import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringToColour = (str: string) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};

export function rectifyFormat(s: string) {
  if (!s) return "";

  const year = s.slice(0, 4);
  const month = s.slice(5, 7);
  const day = s.slice(8, 10);
  const hour = s.slice(11, 13);
  const minute = s.slice(14, 16); 
  const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
  const hour12 = parseInt(hour) > 12 ? parseInt(hour) - 12 : parseInt(hour);

  return `${month}-${day}-${year}, ${hour12}:${minute} ${ampm}`;
}