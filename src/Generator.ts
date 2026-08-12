import fs from 'node:fs/promises';
import path from 'node:path';

import Config from './Config';
import {
  BLUEPRINT_SUFFIX,
  buildItemUniqueNameIndex,
  normalizeRewardName,
  resolveRewardUniqueName,
} from './itemUniqueName';
import logger from './Logger';
import {
  Rarity,
  TitaniaRelic,
  TitaniaRelicLocation,
  TitaniaRelicRewardItem,
  WarframeMarketRoot,
  WFCDItem,
  WFCDRelic,
  WFCDSparseItem,
} from './Types';

export class Generator {
  /** Lowercase item name → uniqueName from sparse warframestat index (+ Blueprint follow-ups) */
  itemUniqueNames: Map<string, string>;

  relics: TitaniaRelic[];

  relicsRaw: undefined | WFCDRelic[];

  wfcdItems: undefined | WFCDItem[];

  wfmItems: undefined | WarframeMarketRoot;

  constructor() {
    this.relics = [];
    this.itemUniqueNames = new Map();
  }

  /**
   * Fetches all required data from WFCD and WFM.
   */
  public async fetchRawData(): Promise<void> {
    const relicRequest = await fetch(Config.warframeRelicDropUrl);
    if (!relicRequest.ok) {
      logger.error('Failed to fetch Warframe relics from WFCD!');
      return;
    }
    this.relicsRaw = ((await relicRequest.json()) as { relics: WFCDRelic[] })?.relics;

    const wfmRequest = await fetch(Config.warframeMarketItemUrl);
    if (!wfmRequest.ok) {
      logger.error('Failed to fetch items from WFM!');
      return;
    }
    this.wfmItems = (await wfmRequest.json()) as WarframeMarketRoot;

    const wfcdItemRequest = await fetch(Config.warframeItemsUrl);
    if (!wfcdItemRequest.ok) {
      logger.error('Failed to fetch items from WFCD! ');
      return;
    }
    this.wfcdItems = (await wfcdItemRequest.json()) as WFCDItem[];

    const sparseRequest = await fetch(Config.warframeItemsSparseUrl);
    if (!sparseRequest.ok) {
      logger.error('Failed to fetch sparse items from WFCD!');
      return;
    }
    const sparseItems = (await sparseRequest.json()) as WFCDSparseItem[];
    this.indexSparseItems(sparseItems);
  }

  /**
   * Main function to fetch and generate the relic data
   * @returns {Promise<Array<TitaniaRelic>>} The Relics data array
   */
  public async generate(): Promise<TitaniaRelic[]> {
    logger.log('Starting Generation');
    await this.fetchRawData();
    this.filterWFCDRelics();
    await this.resolveSpecialRewardUniqueNames();
    this.generateTitaniaRelics();
    return this.relics;
  }

  /**
   * Generates the relic data
   *  uses WFCD/warframe-drop-data to check what relics exist,
   *  and adds information from WFCD/warframe-items and WFM
   */
  public generateTitaniaRelics(): void {
    if (typeof this.relicsRaw === 'undefined' || typeof this.wfmItems === 'undefined') {
      logger.log('Failed to load relics/item data');
      return;
    }
    const { length } = this.relicsRaw;

    for (let i = 0; i < length; i += 1) {
      const rawRelic = this.relicsRaw[i];
      logger.debug(`[${i + 1}/${length}] ${rawRelic.tier} ${rawRelic.relicName}`);

      const relic = this.generateTitaniaRelic(rawRelic);
      this.relics.push(relic);
    }
    logger.debug(`Finished parsing ${this.relics.length} relics`);
  }

  /**
   * Writes the fully generated data to disk.
   * @param {string} dataDir Directory to store the relic data in. Default: ../data/
   * @param {string} fileName Filename base ex: "Relics" becomes "Relics.json" and "Relics.min.json". Default: "Relics"
   * @param {boolean} generateMin True if a minified json should be generated too. Default: true
   */
  public async writeData(dataDir?: string, fileName?: string, generateMin = true) {
    const DataDir = dataDir ?? path.join(__dirname, '..', 'data');
    const RelicPath = fileName ? path.join(DataDir, `${fileName}.json`) : path.join(DataDir, 'Relics.json');
    await fs.writeFile(RelicPath, JSON.stringify(this.relics, undefined, 4));

    if (generateMin) {
      const RelicMinPath = fileName
        ? path.join(DataDir, `${fileName}.min.json`)
        : path.join(DataDir, 'Relics.min.json');
      await fs.writeFile(RelicMinPath, JSON.stringify(this.relics));
    }
  }

  /**
   * Fetch a single warframestat item by name with components for Blueprint resolution.
   * @param {string} name Item display name
   * @returns {Promise<WFCDSparseItem|undefined>} Item or undefined on failure
   */
  private async fetchItemByName(name: string): Promise<undefined | WFCDSparseItem> {
    const url = `${Config.warframeItemByNameUrl}${encodeURIComponent(name)}?only=name,uniqueName,components`;
    const response = await fetch(url);
    if (!response.ok) {
      logger.debug(`Failed to fetch item by name: ${name} (${response.status})`);
      return undefined;
    }
    const data = (await response.json()) as WFCDSparseItem | { error?: string };
    if ('error' in data && data.error) {
      logger.debug(`No item result for: ${name}`);
      return undefined;
    }
    return data as WFCDSparseItem;
  }

  /**
   * Filters WFCD's relic data to only include Intact variants, since we just need the base.
   */
  private filterWFCDRelics() {
    const before = this.relicsRaw?.length ?? 0;
    this.relicsRaw = this.relicsRaw?.filter((x) => x.state === 'Intact');
    logger.log(`Filtered relics to intact variants. Before: ${before} After: ${this.relicsRaw?.length ?? 0}`);
  }

  /**
   * Generates a single relic from all available data
   * @param {WFCDRelic} rawRelic relic to pull Titania data from
   * @returns {TitaniaRelicReward}
   */
  private generateTitaniaRelic(rawRelic: WFCDRelic): TitaniaRelic {
    const name = `${rawRelic.tier} ${rawRelic.relicName}`;

    const rewards = rawRelic.rewards.map((rawReward) => {
      const { chance } = rawReward;
      const { rarity } = rawReward;
      const wfmInfo = this.wfmItems?.data.find((x) => {
        return x.i18n.en.name.toLowerCase() === rawReward.itemName.toLowerCase();
      });
      const isSpecial = ['Forma', 'Kuva', 'Exilus', 'Riven'].find((x) =>
        rawReward.itemName.toLowerCase().includes(x.toLowerCase()),
      );
      if (!(wfmInfo || isSpecial)) {
        logger.debug(`Failed to find wfm item for ${rawReward.itemName}`);
      }

      const item: TitaniaRelicRewardItem = {
        name: rawReward.itemName,
        uniqueName: resolveRewardUniqueName(rawReward.itemName, wfmInfo?.gameRef, this.itemUniqueNames),
        warframeMarket: undefined,
      };
      if (wfmInfo) {
        item.warframeMarket = { id: wfmInfo.id, urlName: wfmInfo.slug };
      }
      return { chance, item, rarity };
    });

    let drops: TitaniaRelicLocation[] = [];
    const wfcdItem = this.wfcdItems?.find((x) => x.name.toLowerCase() === `${name.trim()} Intact`.toLowerCase());

    if (!wfcdItem) {
      logger.error(`Failed to get WFCD item for relic: ${name}`);
    }

    if (wfcdItem?.drops) {
      drops = wfcdItem.drops.map((rawDrop) => {
        return { chance: rawDrop.chance, location: rawDrop.location, rarity: rawDrop.rarity as Rarity };
      });
    }

    const wfm = this.wfmItems?.data.find((x) => {
      return x.i18n.en.name.toLowerCase() === `${name.trim()} Relic`.toLowerCase();
    });
    if (!wfm) {
      logger.error(`Failed to get relic item from wfm: ${name}`);
    }

    return {
      locations: drops,
      name,
      rewards,
      uniqueName: wfcdItem?.uniqueName ?? '',
      vaultInfo: { vaulted: drops.length === 0 },
      ...(wfm?.id && wfm.slug && { warframeMarket: { id: wfm.id, urlName: wfm.slug } }),
    };
  }

  /**
   * Index sparse warframestat items by lowercase name, preferring /Lotus/Types/ paths.
   * @param {Array<WFCDSparseItem>} items Sparse item list from warframestat
   */
  private indexSparseItems(items: WFCDSparseItem[]): void {
    this.itemUniqueNames = buildItemUniqueNameIndex(items);
    logger.debug(`Indexed ${this.itemUniqueNames.size} sparse item uniqueNames`);
  }

  /**
   * For reward names missing WFM, resolve uniqueNames from sparse index.
   * Blueprint-suffixed names need a parent item fetch for the Blueprint component.
   */
  private async resolveSpecialRewardUniqueNames(): Promise<void> {
    if (!this.relicsRaw || !this.wfmItems) {
      return;
    }

    const specialNames = new Set<string>();
    this.relicsRaw.forEach((relic) => {
      relic.rewards.forEach((reward) => {
        const hasWfm = this.wfmItems?.data.some((x) => {
          return x.i18n.en.name.toLowerCase() === reward.itemName.toLowerCase();
        });
        if (!hasWfm) {
          specialNames.add(normalizeRewardName(reward.itemName));
        }
      });
    });

    const blueprintParents = new Map<string, string>();
    Array.from(specialNames).forEach((name) => {
      const key = name.toLowerCase();
      if (this.itemUniqueNames.has(key)) {
        return;
      }
      if (!BLUEPRINT_SUFFIX.test(name)) {
        logger.debug(`No uniqueName for special reward: ${name}`);
        return;
      }
      const parent = name.replace(BLUEPRINT_SUFFIX, '').trim();
      if (parent) {
        blueprintParents.set(name, parent);
      }
    });

    const parentCache = new Map<string, undefined | WFCDSparseItem>();
    for (const [blueprintName, parent] of blueprintParents.entries()) {
      let parentItem = parentCache.get(parent);
      if (!parentCache.has(parent)) {
        parentItem = await this.fetchItemByName(parent);
        parentCache.set(parent, parentItem);
      }
      const blueprint = parentItem?.components?.find((c) => c.name.toLowerCase() === 'blueprint');
      if (blueprint?.uniqueName) {
        this.itemUniqueNames.set(blueprintName.toLowerCase(), blueprint.uniqueName);
      } else {
        logger.debug(`Failed to resolve Blueprint uniqueName for: ${blueprintName}`);
      }
    }
  }
}

export default Generator;
