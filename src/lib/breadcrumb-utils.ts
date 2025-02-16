import { NavigationType } from "@/components/sidebar/types";

function findItem(
  items: Omit<NavigationType, "code" | "icon">[],
  pathname: string,
): Omit<NavigationType, "code" | "icon">[] | null {
  for (const item of items) {
    if (item.url === pathname) {
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
    if (item.url !== "/" && pathname.includes(item.url)) {
      return [item];
    }
  }
  return null; // No match found
}
export function getBreadcrumbs(
  items: Omit<NavigationType, "code" | "icon">[],
  pathname: string,
): Omit<NavigationType, "code" | "icon">[] | null {
  return findItem(items, pathname);
}
