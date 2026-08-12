export type Rarity = 'Common' | 'Legendary' | 'Rare' | 'Uncommon';

export interface TitaniaRelic {
  /**
   * Drop Locations for the relics
   */
  locations: TitaniaRelicLocation[];

  /**
   * Relic Combined Name (Ex: Axi A1)
   */
  name: string;

  /**
   * Relic Rewards when opened
   */
  rewards: TitaniaRelicReward[];

  /** unique name for corresponding warframe-items Item */
  uniqueName: string;

  /**
   * Relic Vault Information
   */
  vaultInfo: TitaniaRelicVaultedInfo;

  /**
   * Warframe Market Information
   *  undefined for untradable
   */
  warframeMarket?: TitaniaWFMInfo;
}

export interface TitaniaRelicLocation {
  /**
   * Dropchance in %
   */
  chance: number;

  /** Location Info $planet-$node (Ex: Eris - Phalan) */
  location: string;

  /**
   * Rarity (Uncommon, Rare ?)
   */
  rarity: Rarity;
}

export interface TitaniaRelicReward {
  /**
   * Reward Drop Chance in %
   */
  chance: number;

  /**
   * Item Information
   */
  item: TitaniaRelicRewardItem;

  /**
   * Relic Rarity (Uncommon,Rare ?)
   */
  rarity: 'Rare' | 'Uncommon';
}

export interface TitaniaRelicRewardItem {
  /**
   * Item Name
   */
  name: string;

  /** unique name for corresponding warframe-items Item */
  uniqueName: string;

  /**
   * WarframeMarket Info
   */
  warframeMarket?: TitaniaWFMInfo;
}

export interface TitaniaRelicVaultedInfo {
  /**
   * If the relic is vaulted
   */
  vaulted: boolean;
}

export interface TitaniaWFMInfo {
  /**
   * Warframe Market ID
   */
  id: string;

  /**
   * Warframe market URL parameter
   */
  urlName: string;
}

export interface WarframeMarketItem {
  /**
   * Unique reference name (Lotus path)
   */
  gameRef: string;

  /**
   * WFM language object
   */
  i18n: {
    /**
     * English language object
     */
    en: {
      /**
       * Item Name
       */
      name: string;

      /**
       * Thumbnail URL relative to wfm api base
       */
      thumb: string;
    };
  };

  /**
   * WFM Item ID
   */
  id: string;

  /**
   * Url name for querying WFM
   */
  slug: string;
}

export interface WarframeMarketRoot {
  data: WarframeMarketItem[];
}

export interface WFCDItem {
  /**
   * Item Drop Location
   */
  drops?: WFCDItemDropLocation[];

  /**
   * Item Name
   */
  name: string;

  /** Unique identifying name */
  uniqueName: string;
}

export interface WFCDItemDropLocation {
  /**
   * Dropchance in %
   */
  chance: number;

  /**
   * Mission location
   */
  location: string;

  /**
   * Drop rarity
   */
  rarity: string;

  /**
   * Relic Type
   */
  type: string;
}

export interface WFCDRelic {
  /**
   * Internal WFCD id
   */
  _id: string;

  /**
   * Relic Name (A1, A10, etc.)
   */
  relicName: string;

  /**
   * Relic Rewards
   */
  rewards: WFCDRelicReward[];

  /**
   * Relic Refinement state
   */
  state: 'Exceptional' | 'Flawless' | 'Intact' | 'Radiant';

  /**
   * Relic Tier (Axi, Neo, etc.)
   */
  tier: string;
}

export interface WFCDRelicReward {
  /**
   * Internal ID
   */
  _id: string;

  /**
   * Actual Dropchance in %
   */
  chance: number;

  /**
   * Dropped Item name
   */
  itemName: string;

  /**
   * Dropchance Rarity (Uncommon/Rare ?)
   */
  rarity: 'Rare' | 'Uncommon';
}

export interface WFCDSparseComponent {
  name: string;
  uniqueName: string;
}

/** Sparse warframestat item (name + uniqueName, optional components) */
export interface WFCDSparseItem {
  components?: WFCDSparseComponent[];
  name: string;
  uniqueName: string;
}
