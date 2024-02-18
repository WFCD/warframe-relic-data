import fs from 'node:fs/promises';
import path from 'node:path';

import fetch from 'node-fetch';

import {
  TitaniaRelic,
  TitaniaRelicLocation,
  TitaniaRelicReward,
  TitaniaRelicRewardItem,
  WarframeMarketRoot,
  WFCDItem,
  WFCDRelic,
  Rarity,
} from './Types';
import Config from './Config';
import logger from './Logger';

export class Generator {
  relicsRaw: Array<WFCDRelic> | undefined;

  wfcdItems: Array<WFCDItem> | undefined;

  wfmItems: WarframeMarketRoot | undefined;

  relics: Array<TitaniaRelic>;

  constructor() {
    this.relics = [];
  }

  /**
   * Main function to fetch and generate the relic data
   * @returns {Promise<Array<TitaniaRelic>>} The Relics data array
   */
  public async generate(): Promise<Array<TitaniaRelic>> {
    logger.log('Starting Generation');
    await this.fetchRawData();
    this.filterWFCDRelics();
    this.generateTitaniaRelics();
    return this.relics;
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
    this.relicsRaw = ((await relicRequest.json()) as { relics: Array<WFCDRelic> })?.relics;

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
    this.wfcdItems = (await wfcdItemRequest.json()) as Array<WFCDItem>;
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
  public async writeData(dataDir?: string, fileName?: string, generateMin?: boolean) {
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
   * Generates a single relic from all available data
   * @param {WFCDRelic} rawRelic relic to pull Titania data from
   * @returns {TitaniaRelicReward}
   */
  private generateTitaniaRelic(rawRelic: WFCDRelic): TitaniaRelic {
    const name = `${rawRelic.tier} ${rawRelic.relicName}`;

    const rewards = rawRelic.rewards.map((rawReward) => {
      const { chance } = rawReward;
      const { rarity } = rawReward;
      const wfmInfo = this.wfmItems?.payload.items.find((x) => x.item_name === rawReward.itemName);
      const isSpecial = ['Forma', 'Kuva', 'Exilus', 'Riven'].find((x) =>
        // eslint-disable-next-line @typescript-eslint/comma-dangle
        rawReward.itemName.toLowerCase().includes(x.toLowerCase())
      );
      if (!(wfmInfo || isSpecial)) {
        logger.debug(`Failed to find wfm item for ${rawReward.itemName}`);
      }

      const item: TitaniaRelicRewardItem = {
        name: rawReward.itemName,
        uniqueName:
          this.wfcdItems?.find((x) => x.name.toLowerCase() === `${name.trim()} Intact`.toLowerCase())?.uniqueName || '',
        warframeMarket: undefined,
      };
      if (wfmInfo) {
        item.warframeMarket = { id: wfmInfo.id, urlName: wfmInfo.url_name };
      }
      return { rarity, chance, item } as TitaniaRelicReward;
    });

    let drops: Array<TitaniaRelicLocation> = [];
    const wfcdItem = this.wfcdItems?.find((x) => x.name.toLowerCase() === `${name.trim()} Intact`.toLowerCase());

    if (!wfcdItem) {
      logger.error(`Failed to get WFCD item for relic: ${name}`);
    }

    if (wfcdItem && wfcdItem.drops) {
      drops = wfcdItem.drops.map((rawDrop) => {
        return { rarity: rawDrop.rarity as Rarity, chance: rawDrop.chance, location: rawDrop.location };
      });
    }

    const wfm = this.wfmItems?.payload.items.find((x) => x.item_name === `${name.trim()} Relic`);
    if (!wfm) {
      logger.error(`Failed to get relic item from wfm: ${name}`);
    }

    return {
      name,
      rewards,
      locations: drops,
      uniqueName: wfcdItem?.uniqueName || '',
      vaultInfo: { vaulted: drops.length === 0 },
      ...(wfm?.id && wfm?.url_name && { warframeMarket: { id: wfm?.id, urlName: wfm?.url_name } }),
    };
  }

  /**
   * Filters WFCD's relic data to only include Intact variants, since we just need the base.
   */
  private filterWFCDRelics() {
    const before = this.relicsRaw?.length || 0;
    this.relicsRaw = this.relicsRaw?.filter((x) => x.state === 'Intact');
    logger.log(`Filtered relics to intact variants. Before: ${before} After: ${this.relicsRaw?.length || 0}`);
  }
}

export default Generator;
