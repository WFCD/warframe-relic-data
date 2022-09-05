"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionManager = void 0;
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const Config_1 = require("./Config");
class VersionManager {
    versionPath;
    versionRawPath;
    hashPath;
    /**
     * Creates a new VersionManager instance.
     * @param dataDir Folder to write version information to.
     */
    constructor(dataDir) {
        const DataDir = dataDir ?? node_path_1.default.join(__dirname, "..", "data");
        this.versionPath = node_path_1.default.join(DataDir, "version.json");
        this.versionRawPath = node_path_1.default.join(DataDir, "version.txt");
        this.hashPath = node_path_1.default.join(DataDir, "hash.json");
    }
    /**
     * Checks if the current data needs an update
     */
    async updateNeeded() {
        const infoReq = await (0, node_fetch_1.default)(Config_1.Config.warframeRelicDropInfoUrl);
        if (!infoReq.ok) {
            console.error("Failed to fetch version info !");
            throw new Error("Failed to complete version check !");
        }
        const info = await infoReq.json();
        try {
            await promises_1.default.access(this.hashPath);
            const infoFile = JSON.parse(await promises_1.default.readFile(this.hashPath, "utf-8"));
            return infoFile.hash !== info.hash;
        }
        catch (ex) {
            // Info file doesnt exist, so we need an update
            return true;
        }
    }
    /**
     * Writes both game and drop version metadata
     * @param timestamp Timestamp the build was started at
     */
    async writeVersion(timestamp) {
        const patchLogsReq = await (0, node_fetch_1.default)(Config_1.Config.warframePatchlogsUrl);
        if (!patchLogsReq.ok) {
            console.error("Failed to fetch patchlogs");
            return;
        }
        const patchlogs = await patchLogsReq.json();
        // Shamelessly stolen from https://github.com/WFCD/warframe-items/blob/master/build/build.js 
        // (MIT License: https://github.com/WFCD/warframe-items/blob/master/LICENSE)
        const version = patchlogs[0].name.replace(/ \+ /g, '--').replace(/[^0-9\-.]/g, '').trim();
        const hashReq = await (0, node_fetch_1.default)(Config_1.Config.warframeRelicDropInfoUrl);
        if (!hashReq.ok) {
            console.error("Failed to fetch hashInfo");
            return;
        }
        const hashInfo = await hashReq.json();
        const versionInfo = { version, title: patchlogs[0].name };
        const hashFile = { hash: hashInfo.hash, deUpdated: hashInfo.modified, timestamp: timestamp };
        await promises_1.default.writeFile(this.hashPath, JSON.stringify(hashFile, null, 2), "utf-8");
        await promises_1.default.writeFile(this.versionPath, JSON.stringify(versionInfo, null, 2), "utf-8");
        await promises_1.default.writeFile(this.versionRawPath, version, "utf-8");
        console.log("Finished writing version info");
    }
}
exports.VersionManager = VersionManager;
//# sourceMappingURL=VersionManager.js.map