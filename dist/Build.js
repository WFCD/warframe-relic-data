"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Generator_1 = require("./Generator");
const VersionManager_1 = require("./VersionManager");
const Logger_1 = __importDefault(require("./Logger"));
/**
 * Entrypoint for the build process.
 */
async function run() {
    const generator = new Generator_1.Generator();
    const versionManager = new VersionManager_1.VersionManager();
    const date = Date.now();
    Logger_1.default.log(`Starting build ${date}`);
    const needsUpdate = await versionManager.updateNeeded();
    if (needsUpdate) {
        Logger_1.default.log("Found update, starting generation");
        await generator.generate();
        await generator.writeData();
        await versionManager.writeVersion(date);
    }
    else {
        Logger_1.default.log("No updates found !");
    }
    Logger_1.default.log("Build finished.");
}
run().catch(Logger_1.default.error);
//# sourceMappingURL=Build.js.map