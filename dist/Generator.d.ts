import { TitaniaRelic, WarframeMarketRoot, WFCDItem, WFCDRelic } from "./Types";
declare class Generator {
    relicsRaw: Array<WFCDRelic> | undefined;
    wfcdItems: Array<WFCDItem> | undefined;
    wfmItems: WarframeMarketRoot | undefined;
    relics: Array<TitaniaRelic>;
    constructor();
    /**
     * Main function to fetch and generate the relic data
     * @returns The Relics data array
     */
    generate(): Promise<Array<TitaniaRelic>>;
    /**
     * Fetches all required data from WFCD and WFM.
     */
    fetchRawData(): Promise<void>;
    /**
     * Generates the relic data (uses WFCD/warframe-drop-data to check what relics exist, and adds information from WFCD/warframe-items and WFM)
     */
    generateTitaniaRelics(): void;
    /**
     * Writes the fully generated data to disk.
     * @param dataDir Directory to store the relic data in. Default: ../data/
     * @param fileName Filename base ex: "Relics" becomes "Relics.json" and "Relics.min.json". Default: "Relics"
     * @param generateMin True if a minified json should be generated too. Default: true
     */
    writeData(dataDir?: string, fileName?: string, generateMin?: boolean): Promise<void>;
    /**
     * Generates a single relic from all available data
     */
    private generateTitaniaRelic;
    /**
     * Filters WFCD's relic data to only include Intact variants, since we just need the base.
     */
    private filterWFCDRelics;
}
export { Generator };
