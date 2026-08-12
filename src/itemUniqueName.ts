import { WFCDSparseItem } from './Types';

const QTY_PREFIX = /^\d+X\s+/i;
export const BLUEPRINT_SUFFIX = / Blueprint$/i;

/**
 * Index sparse warframestat items by lowercase name, preferring higher-ranked uniqueNames.
 * @param {Array<WFCDSparseItem>} items Sparse item list from warframestat
 * @returns {Map<string, string>} Lowercase name → uniqueName
 */
export function buildItemUniqueNameIndex(items: WFCDSparseItem[]): Map<string, string> {
  const index = new Map<string, string>();
  items.forEach((item) => {
    if (!item?.name || !item?.uniqueName) {
      return;
    }
    const key = item.name.toLowerCase();
    const existing = index.get(key);
    if (!existing || uniqueNameRank(item.uniqueName) > uniqueNameRank(existing)) {
      index.set(key, item.uniqueName);
    }
  });
  return index;
}

/**
 * Strip drop quantity prefixes (e.g. "1200X Kuva" → "Kuva").
 * @param {string} itemName Raw drop item name
 * @returns {string} Name without quantity prefix
 */
export function normalizeRewardName(itemName: string): string {
  return itemName.replace(QTY_PREFIX, '').trim();
}

/**
 * Resolve reward uniqueName from WFM gameRef or sparse name index.
 * @param {string} itemName Raw drop item name
 * @param {string|undefined} gameRef WFM gameRef when matched
 * @param {Map<string, string>} itemUniqueNames Sparse (+ Blueprint) index
 * @returns {string} Lotus uniqueName or empty string
 */
export function resolveRewardUniqueName(
  itemName: string,
  gameRef: string | undefined,
  itemUniqueNames: Map<string, string>,
): string {
  if (gameRef) {
    return gameRef;
  }
  return itemUniqueNames.get(normalizeRewardName(itemName).toLowerCase()) ?? '';
}

/**
 * Prefer in-world item/recipe paths over StoreItems, enemies, and other duplicates.
 * @param {string} uniqueName Lotus path
 * @returns {number} Higher is preferred
 */
export function uniqueNameRank(uniqueName: string): number {
  if (uniqueName.includes('/Enemies/')) {
    return 0;
  }
  if (uniqueName.startsWith('/Lotus/Types/Items/') || uniqueName.startsWith('/Lotus/Types/Recipes/')) {
    return 3;
  }
  if (uniqueName.startsWith('/Lotus/Types/')) {
    return 2;
  }
  if (uniqueName.startsWith('/Lotus/StoreItems/')) {
    return 1;
  }
  return 0;
}
