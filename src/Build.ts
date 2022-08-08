import { Generator } from "./Generator";
import { VersionManager } from "./VersionManager";

/**
 * Entrypoint for the build process.
 */
async function run(){
    const generator = new Generator();
    const versionManager = new VersionManager();
    const date = Date.now();
    console.log(`Starting build ${date}`);
    const needsUpdate = await versionManager.updateNeeded();
    if(needsUpdate){
        console.log("Found update, starting generation");
        await generator.generate();
        await versionManager.writeVersion(date);
    }
    else {
        console.log("No updates found !");
    }
    console.log("Build finished.")
    
}

run().catch(x => console.error(x));