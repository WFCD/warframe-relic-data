import fetch from "node-fetch";
import fs from "node:fs/promises";
import path from "node:path";
import { Config } from "./Config";
import { TitaniaRelic, TitaniaRelicLocation, TitaniaRelicReward, TitaniaRelicRewardItem, WarframeMarketRoot, WFCDItem, WFCDRelic } from "./Types";


class Generator {

    relicsRaw: Array<WFCDRelic> | undefined;
    wfcdItems: Array<WFCDItem> | undefined;
    wfmItems: WarframeMarketRoot | undefined;
    relics: Array<TitaniaRelic>
    constructor(){
        this.relics = [];
    }

    /**
     * Main function to fetch and generate the relic data
     */
    public async generate(): Promise<void> {
        console.log("Starting Generation");
        await this.fetchRawData();
        this.filterWFCDRelics();
        this.generateTitaniaRelics();
    }

    /**
     * Fetches all required data from WFCD and WFM.
     */
    public async fetchRawData(): Promise<void> {
        const relicRequest = await fetch(Config.warframeRelicDropUrl);
        if(!relicRequest.ok){
            console.error("Failed to fetch Warframe relics from WFCD !");
            return;
        }
        this.relicsRaw = (await relicRequest.json()).relics as Array<WFCDRelic>;
        

        const wfmRequest = await fetch(Config.warframeMarketItemUrl);
        if(!wfmRequest.ok){
            console.error("Failed to fetch items from WFM !")
            return;
        }
        this.wfmItems = await wfmRequest.json() as WarframeMarketRoot;

        const wfcdItemRequest = await fetch(Config.warframeItemsUrl);
        if(!wfcdItemRequest.ok){
            console.error("Failed to fetch items from WFCD! ");
            return;
        }
        this.wfcdItems = await wfcdItemRequest.json() as Array<WFCDItem>;
    }

    /**
     * Generates the relic data (uses WFCD/warframe-drop-data to check what relics exist, and adds information from WFCD/warframe-items and WFM)
     */
    public generateTitaniaRelics(): void {
        if(typeof this.relicsRaw === "undefined" || typeof this.wfmItems === "undefined"){
            console.log("Failed to load relics/item data");
            return;
        }
        const length = this.relicsRaw.length;

        for(let i = 0; i < length; ++i){
            const rawRelic = this.relicsRaw[i];
            console.log(`[${i + 1}/${length}] ${rawRelic.tier} ${rawRelic.relicName}`);
            
            const relic = this.generateTitaniaRelic(rawRelic);
            this.relics.push(relic);
        }
        console.log(`Finished parsing ${this.relics.length} relics`);
    }

    /**
     * Writes the fully generated data to disk.
     * @param dataDir Directory to store the relic data in. Default: ../data/
     * @param fileName Filename base ex: "Relics" becomes "Relics.json" and "Relics.min.json". Default: "Relics"
     * @param generateMin True if a minified json should be generated too. Default: true
     */
    public async writeData(dataDir?: string, fileName?: string, generateMin?: boolean){
        const DataDir = dataDir ?? path.join(__dirname, "..", "data");
        const RelicPath = fileName ? path.join(DataDir, `${fileName}.json`) : path.join(DataDir, "Relics.json");
        await fs.writeFile(RelicPath, JSON.stringify(this.relics, null, 4));

        if(generateMin){
            const RelicMinPath = fileName ? path.join(DataDir, `${fileName}.min.json`) : path.join(DataDir, "Relics.min.json");
            await fs.writeFile(RelicMinPath, JSON.stringify(this.relics));
        }
    }

    /**
     * Generates a single relic from all available data
     */
    private generateTitaniaRelic(rawRelic: WFCDRelic): TitaniaRelic {
        const name = `${rawRelic.tier} ${rawRelic.relicName}`;

        const rewards = rawRelic.rewards.map(rawReward => {
            const chance = rawReward.chance;
            const rarity = rawReward.rarity;
            const wfmInfo = this.wfmItems?.payload.items.find(x => x.item_name === rawReward.itemName);
            if(!wfmInfo && !["Forma", "Kuva", "Exilus", "Riven"].find(x => rawReward.itemName.toLowerCase().includes(x.toLowerCase()))){
                console.error(`Failed to find wfm item for ${rawReward.itemName}`);
            }

            const item: TitaniaRelicRewardItem = { name: rawReward.itemName, warframeMarket: null}
            if(wfmInfo){
                item.warframeMarket = { id: wfmInfo.id, urlName: wfmInfo.url_name };
            }
            return { rarity, chance, item } as TitaniaRelicReward
        });

        let drops: Array<TitaniaRelicLocation> = [];

        
        const wfcdItem = this.wfcdItems?.find(x => x.name.toLowerCase() === `${name.trim()} Intact`.toLowerCase());
        
        if(!wfcdItem){
            console.error("Failed to get WFCD item for relic: " + name);
        }

        if(wfcdItem && wfcdItem.drops){
            drops = wfcdItem.drops.map(rawDrop => {
                return {rarity: rawDrop.rarity, chance: rawDrop.chance, location: rawDrop.location };
            });
        }

        const wfm = this.wfmItems?.payload.items.find(x => x.item_name === `${name.trim()} Relic`);
        if(!wfm){
            console.error("Failed to get relic item from wfm: " + name);
        }

        return { name, rewards, locations: drops, vaultInfo: { vaulted: drops.length == 0, vaultDate: ""}, warframeMarket: { id: wfm?.id!, urlName: wfm?.url_name!}};
    }

    /**
     * Filters WFCD's relic data to only include Intact variants, since we just need the base.
     */
    private filterWFCDRelics(){
        const before = this.relicsRaw?.length;
        this.relicsRaw = this.relicsRaw?.filter(x => x.state === "Intact");
        console.log(`Filtered relics to intact variants. Before: ${before} After: ${this.relicsRaw?.length}`)
    }
}

export { Generator };