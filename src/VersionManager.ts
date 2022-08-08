import path from "node:path";
import fs from "node:fs/promises";
import fetch from "node-fetch";
import { Config } from "./Config";


class VersionManager {

    versionPath: string;
    versionRawPath: string;
    hashPath: string;
    constructor(){
        const dataDir = path.join(__dirname, "..", "data");
        this.versionPath = path.join(dataDir, "version.json");
        this.versionRawPath = path.join(dataDir, "version.txt");
        this.hashPath = path.join(dataDir, "hash.json");
    }

    /**
     * Checks if the current data needs an update
     */
    async updateNeeded(): Promise<boolean> {
        const infoReq = await fetch(Config.warframeRelicDropInfoUrl);
        if(!infoReq.ok){
            console.error("Failed to fetch version info !");
            throw new Error("Failed to complete version check !");
        }
        const info: { hash: string, timestamp: string, modified: string } = await infoReq.json();

        
        try {
            await fs.access(this.hashPath)
            const infoFile: {hash: string} = JSON.parse(await fs.readFile(this.hashPath, "utf-8"));
            return infoFile.hash !== info.hash;
        }
        catch(ex){
            // Info file doesnt exist, so we need an update
            return true;
        }
    }

    /**
     * Writes both game and drop version metadata
     * @param timestamp Timestamp the build was started at
     */
    async writeVersion(timestamp: number): Promise<void> {
        const patchLogsReq = await fetch(Config.warframePatchlogsUrl);
        if(!patchLogsReq.ok){
            console.error("Failed to fetch patchlogs");
            return;
        }
        const patchlogs = await patchLogsReq.json();

        // Shamelessly stolen from https://github.com/WFCD/warframe-items/blob/master/build/build.js 
        // (MIT License: https://github.com/WFCD/warframe-items/blob/master/LICENSE)
        const version: string = patchlogs[0].name.replace(/ \+ /g, '--').replace(/[^0-9\-.]/g, '').trim();
        
        const hashReq = await fetch(Config.warframeRelicDropInfoUrl);
        if(!hashReq.ok){
            console.error("Failed to fetch hashInfo");
            return;
        }
        const hashInfo: { hash: string, modified: string } = await hashReq.json();
        const versionInfo = {version, title: patchlogs[0].name };

        const hashFile = { hash: hashInfo.hash, deUpdated: hashInfo.modified, timestamp: timestamp };
        await fs.writeFile(this.hashPath, JSON.stringify(hashFile, null, 2), "utf-8");
        await fs.writeFile(this.versionPath, JSON.stringify(versionInfo, null, 2), "utf-8");
        await fs.writeFile(this.versionRawPath, version, "utf-8");
        console.log("Finished writing version info");
    }
}

export { VersionManager };