import { Generator } from './Generator';
import { VersionManager } from './VersionManager';
import logger from './Logger';

/**
 * Entrypoint for the build process.
 */
async function run() {
  const generator = new Generator();
  const versionManager = new VersionManager();
  const date = Date.now();
  logger.log(`Starting build ${date}`);
  const needsUpdate = await versionManager.updateNeeded();
  if (needsUpdate) {
    logger.log('Found update, starting generation');
    await generator.generate();
    await generator.writeData();
    await versionManager.writeVersion(date);
  } else {
    logger.log('No updates found !');
  }
  logger.log('Build finished.');
}

run().catch(logger.error.bind(logger));
