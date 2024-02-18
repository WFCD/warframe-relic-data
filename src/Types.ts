export interface WarframeMarketRoot {
  payload: {
    items: Array<WarframeMarketItem>;
  };
}

export interface WarframeMarketItem {
  /**
   * WFM Item ID
   */
  id: string;

  /**
   * Url name for querying WFM
   */
  url_name: string;

  /**
   * Thumbnail URL relative to wfm api base
   */
  thumb: string;

  /**
   * Item Name
   */
  item_name: string;
}

export interface WFCDRelic {
  /**
   * Relic Tier (Axi, Neo, etc.)
   */
  tier: string;

  /**
   * Relic Name (A1, A10, etc.)
   */
  relicName: string;

  /**
   * Relic Refinement state
   */
  state: 'Intact' | 'Exceptional' | 'Flawless' | 'Radiant';

  /**
   * Relic Rewards
   */
  rewards: Array<WFCDRelicReward>;

  /**
   * Internal WFCD id
   */
  _id: string;
}

export interface WFCDRelicReward {
  /**
   * Dropped Item name
   */
  itemName: string;

  /**
   * Dropchance Rarity (Uncommon/Rare ?)
   */
  rarity: 'Uncommon' | 'Rare';

  /**
   * Actual Dropchance in %
   */
  chance: number;

  /**
   * Internal ID
   */
  _id: string;
}

export interface WFCDItem {
  /**
   * Item Name
   */
  name: string;

  /** Unique identifying name */
  uniqueName: string;

  /**
   * Item Drop Location
   */
  drops?: Array<WFCDItemDropLocation>;
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

export interface TitaniaRelic {
  /**
   * Relic Combined Name (Ex: Axi A1)
   */
  name: string;

  /**
   * Relic Rewards when opened
   */
  rewards: Array<TitaniaRelicReward>;

  /**
   * Drop Locations for the relics
   */
  locations: Array<TitaniaRelicLocation>;

  /**
   * Warframe Market Information
   *  undefined for untradable
   */
  warframeMarket?: TitaniaWFMInfo;

  /**
   * Relic Vault Information
   */
  vaultInfo: TitaniaRelicVaultedInfo;

  /** unique name for corresponding warframe-items Item */
  uniqueName: string;
}

export interface TitaniaRelicReward {
  /**
   * Relic Rarity (Uncommon,Rare ?)
   */
  rarity: 'Uncommon' | 'Rare';

  /**
   * Reward Drop Chance in %
   */
  chance: number;

  /**
   * Item Information
   */
  item: TitaniaRelicRewardItem;
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

export type Rarity = 'Uncommon' | 'Rare' | 'Legendary' | 'Common';

export interface TitaniaRelicLocation {
  /** Location Info $planet-$node (Ex: Eris - Phalan) */
  location: string;

  /**
   * Rarity (Uncommon, Rare ?)
   */
  rarity: Rarity;

  /**
   * Dropchance in %
   */
  chance: number;
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

export interface TitaniaRelicVaultedInfo {
  /**
   * If the relic is vaulted
   */
  vaulted: boolean;
}
