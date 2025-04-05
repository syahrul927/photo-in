import { NavigationType } from "@/components/sidebar/types";
import { PAGE_URLS } from "./page-url";

function findItem(
  items: Omit<NavigationType, "code" | "icon">[],
  pathname: string,
): Omit<NavigationType, "code" | "icon">[] | null {
  for (const item of items) {
    if (areEqualWithWildcard(pathname, item.url)) {
      return [item]; // Found the matching item
    }
    if (item.items) {
      const childResult = findItem(item.items, pathname);
      if (childResult) {
        return [item, ...childResult];
      }
    }
  }
  for (const item of items) {
    if (item.url !== PAGE_URLS.HOME && pathname.includes(item.url)) {
      return [item];
    }
  }
  return null; // No match found
}

function areEqualWithWildcard(str1: string, pattern: string): boolean {
  str1 = str1.replace(/^\/|\/$/g, "");
  pattern = pattern.replace(/^\/|\/$/g, "");

  // Convert wildcard (*) in the pattern into a regex (match anything between slashes)
  const regexPattern = "^" + pattern.replace(/\*/g, "[^/]+") + "$";
  const regex = new RegExp(regexPattern);

  return regex.test(str1);
}
export function getBreadcrumbs(
  items: Omit<NavigationType, "code" | "icon">[],
  pathname: string,
): Omit<NavigationType, "code" | "icon">[] | null {
  return findItem(items, pathname);
}
