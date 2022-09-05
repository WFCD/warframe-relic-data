interface WarframeMarketRoot {
    payload: {
        items: Array<WarframeMarketItem>;
    };
}
interface WarframeMarketItem {
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
interface WFCDRelic {
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
    state: "Intact" | "Exceptional" | "Flawless" | "Radiant";
    /**
     * Relic Rewards
     */
    rewards: Array<WFCDRelicReward>;
    /**
     * Internal WFCD id
     */
    _id: string;
}
interface WFCDRelicReward {
    /**
     * Dropped Item name
     */
    itemName: string;
    /**
     * Dropchance Rarity (Uncommon/Rare ?)
     */
    rarity: "Uncommon" | "Rare";
    /**
     * Actual Dropchance in %
     */
    chance: number;
    /**
     * Internal ID
     */
    _id: string;
}
interface WFCDItem {
    /**
     * Item Name
     */
    name: string;
    /**
     * Item Drop Location
     */
    drops?: Array<WFCDItemDropLocation>;
}
interface WFCDItemDropLocation {
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
interface TitaniaRelic {
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
     */
    warframeMarket: TitaniaWFMInfo;
    /**
     * Relic Vault Information
     */
    vaultInfo: TitaniaRelicVaultedInfo;
}
interface TitaniaRelicReward {
    /**
     * Relic Rarity (Uncommon,Rare ?)
     */
    rarity: "Uncommon" | "Rare";
    /**
     * Reward Drop Chance in %
     */
    chance: number;
    /**
     * Item Information
     */
    item: TitaniaRelicRewardItem;
}
interface TitaniaRelicRewardItem {
    /**
     * Item Name
     */
    name: string;
    /**
     * WarframeMarket Info
     */
    warframeMarket: TitaniaWFMInfo | null;
}
interface TitaniaRelicLocation {
    /** Location Info $planet-$node (Ex: Eris - Phalan) */
    location: string;
    /**
     * Rarity (Uncommon, Rare ?)
     */
    rarity: "Uncommon" | "Rare" | "Legendary" | "Common" | string;
    /**
     * Dropchance in %
     */
    chance: number;
}
interface TitaniaWFMInfo {
    /**
     * Warframe Market ID
     */
    id: string;
    /**
     * Warframe market URL parameter
     */
    urlName: string;
}
interface TitaniaRelicVaultedInfo {
    /**
     * If the relic is vaulted
     */
    vaulted: boolean;
    /**
     * Vaulted Date
     */
    vaultDate: string;
}
export { WarframeMarketRoot, WarframeMarketItem, WFCDRelic, WFCDRelicReward, TitaniaRelic, TitaniaRelicLocation, TitaniaRelicReward, TitaniaRelicRewardItem, TitaniaRelicVaultedInfo, TitaniaWFMInfo, WFCDItem, WFCDItemDropLocation };
