export interface Relic {
    name: string;
    rewards: Reward[]
    locations: Location[];
    vaulted: boolean;
    warframeMarket: WarframeMarketId | null;
}

export interface Reward {
    type: "Common" | "Uncommon" | "Rare" | string;
    chance: string;
    item: string;
}

export interface Location {
    location: string;
    rarity: "Common" | "Uncommon" | "Rare" | string;
    chance: number;
    rotation?: string;
}

export interface WarframeMarketId {
    urlName: string;
    id: string;
}

// https://github.com/WFCD/warframe-items/
export interface DropRelic {
    name: string;
    drops: DropRelicLocation[];
}

export interface DropRelicLocation {
    location: string;
    type: string;
    chance: number;
    rotation?: string;
    rarity: string;
}

// Warframe.market

export interface MarketItemRoot {
    payload: MarketPayload;
}

export interface MarketPayload {
    items: MarketItem[]
}

export interface MarketItem {
    id: string;
    url_name: string;
    item_name: string;
}