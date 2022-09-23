"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const Config_1 = require("./Config");
const Logger_1 = __importDefault(require("./Logger"));
class Generator {
    relicsRaw;
    wfcdItems;
    wfmItems;
    relics;
    constructor() {
        this.relics = [];
    }
    /**
     * Main function to fetch and generate the relic data
     * @returns The Relics data array
     */
    async generate() {
        Logger_1.default.log("Starting Generation");
        await this.fetchRawData();
        this.filterWFCDRelics();
        this.generateTitaniaRelics();
        return this.relics;
    }
    /**
     * Fetches all required data from WFCD and WFM.
     */
    async fetchRawData() {
        const relicRequest = await (0, node_fetch_1.default)(Config_1.Config.warframeRelicDropUrl);
        if (!relicRequest.ok) {
            Logger_1.default.error("Failed to fetch Warframe relics from WFCD!");
            return;
        }
        this.relicsRaw = (await relicRequest.json()).relics;
        const wfmRequest = await (0, node_fetch_1.default)(Config_1.Config.warframeMarketItemUrl);
        if (!wfmRequest.ok) {
            Logger_1.default.error("Failed to fetch items from WFM!");
            return;
        }
        this.wfmItems = await wfmRequest.json();
        const wfcdItemRequest = await (0, node_fetch_1.default)(Config_1.Config.warframeItemsUrl);
        if (!wfcdItemRequest.ok) {
            Logger_1.default.error("Failed to fetch items from WFCD! ");
            return;
        }
        this.wfcdItems = await wfcdItemRequest.json();
    }
    /**
     * Generates the relic data (uses WFCD/warframe-drop-data to check what relics exist, and adds information from WFCD/warframe-items and WFM)
     */
    generateTitaniaRelics() {
        if (typeof this.relicsRaw === "undefined" || typeof this.wfmItems === "undefined") {
            Logger_1.default.log("Failed to load relics/item data");
            return;
        }
        const length = this.relicsRaw.length;
        for (let i = 0; i < length; ++i) {
            const rawRelic = this.relicsRaw[i];
            Logger_1.default.debug(`[${i + 1}/${length}] ${rawRelic.tier} ${rawRelic.relicName}`);
            const relic = this.generateTitaniaRelic(rawRelic);
            this.relics.push(relic);
        }
        Logger_1.default.debug(`Finished parsing ${this.relics.length} relics`);
    }
    /**
     * Writes the fully generated data to disk.
     * @param dataDir Directory to store the relic data in. Default: ../data/
     * @param fileName Filename base ex: "Relics" becomes "Relics.json" and "Relics.min.json". Default: "Relics"
     * @param generateMin True if a minified json should be generated too. Default: true
     */
    async writeData(dataDir, fileName, generateMin) {
        const DataDir = dataDir ?? node_path_1.default.join(__dirname, "..", "data");
        const RelicPath = fileName ? node_path_1.default.join(DataDir, `${fileName}.json`) : node_path_1.default.join(DataDir, "Relics.json");
        await promises_1.default.writeFile(RelicPath, JSON.stringify(this.relics, null, 4));
        if (generateMin) {
            const RelicMinPath = fileName ? node_path_1.default.join(DataDir, `${fileName}.min.json`) : node_path_1.default.join(DataDir, "Relics.min.json");
            await promises_1.default.writeFile(RelicMinPath, JSON.stringify(this.relics));
        }
    }
    /**
     * Generates a single relic from all available data
     */
    generateTitaniaRelic(rawRelic) {
        const name = `${rawRelic.tier} ${rawRelic.relicName}`;
        const rewards = rawRelic.rewards.map(rawReward => {
            const chance = rawReward.chance;
            const rarity = rawReward.rarity;
            const wfmInfo = this.wfmItems?.payload.items.find(x => x.item_name === rawReward.itemName);
            if (!wfmInfo && !["Forma", "Kuva", "Exilus", "Riven"].find(x => rawReward.itemName.toLowerCase().includes(x.toLowerCase()))) {
                Logger_1.default.debug(`Failed to find wfm item for ${rawReward.itemName}`);
            }
            const item = { name: rawReward.itemName, warframeMarket: null };
            if (wfmInfo) {
                item.warframeMarket = { id: wfmInfo.id, urlName: wfmInfo.url_name };
            }
            return { rarity, chance, item };
        });
        let drops = [];
        const wfcdItem = this.wfcdItems?.find(x => x.name.toLowerCase() === `${name.trim()} Intact`.toLowerCase());
        if (!wfcdItem) {
            Logger_1.default.error("Failed to get WFCD item for relic: " + name);
        }
        if (wfcdItem && wfcdItem.drops) {
            drops = wfcdItem.drops.map(rawDrop => {
                return { rarity: rawDrop.rarity, chance: rawDrop.chance, location: rawDrop.location };
            });
        }
        const wfm = this.wfmItems?.payload.items.find(x => x.item_name === `${name.trim()} Relic`);
        if (!wfm) {
            Logger_1.default.error("Failed to get relic item from wfm: " + name);
        }
        return { name, rewards, locations: drops, vaultInfo: { vaulted: drops.length == 0, vaultDate: "" }, warframeMarket: { id: wfm?.id, urlName: wfm?.url_name } };
    }
    /**
     * Filters WFCD's relic data to only include Intact variants, since we just need the base.
     */
    filterWFCDRelics() {
        const before = this.relicsRaw?.length;
        this.relicsRaw = this.relicsRaw?.filter(x => x.state === "Intact");
        Logger_1.default.log(`Filtered relics to intact variants. Before: ${before} After: ${this.relicsRaw?.length}`);
    }
}
exports.Generator = Generator;
//# sourceMappingURL=Generator.js.map