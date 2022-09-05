"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Generator_1 = require("./Generator");
const VersionManager_1 = require("./VersionManager");
/**
 * Entrypoint for the build process.
 */
async function run() {
    const generator = new Generator_1.Generator();
    const versionManager = new VersionManager_1.VersionManager();
    const date = Date.now();
    console.log(`Starting build ${date}`);
    const needsUpdate = await versionManager.updateNeeded();
    if (needsUpdate) {
        console.log("Found update, starting generation");
        await generator.generate();
        await generator.writeData();
        await versionManager.writeVersion(date);
    }
    else {
        console.log("No updates found !");
    }
    console.log("Build finished.");
}
run().catch(x => console.error(x));
//# sourceMappingURL=Build.js.map