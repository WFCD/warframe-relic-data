import path from 'node:path';
import fs from 'node:fs/promises';

import fetch from 'node-fetch';
import { PatchData } from 'warframe-patchlogs';

import Config from './Config';
import logger from './Logger';

interface DropsInfo {
  hash: string;
  timestamp: string;
  modified: string;
}
interface DropsInfoFile {
  hash: string;
}

export class VersionManager {
  versionPath: string;

  versionRawPath: string;

  hashPath: string;

  /**
   * Creates a new VersionManager instance.
   * @param {string} dataDir Folder to write version information to.
   * @constructor
   */
  constructor(dataDir?: string) {
    const DataDir = dataDir ?? path.join(__dirname, '..', 'data');
    this.versionPath = path.join(DataDir, 'version.json');
    this.versionRawPath = path.join(DataDir, 'version.txt');
    this.hashPath = path.join(DataDir, 'hash.json');
  }

  /**
   * Checks if the current data needs an update
   */
  async updateNeeded(): Promise<boolean> {
    const infoReq = await fetch(Config.warframeRelicDropInfoUrl);
    if (!infoReq.ok) {
      logger.fatal('Failed to fetch version info!');
    }
    const info: DropsInfo = (await infoReq.json()) as unknown as DropsInfo;

    try {
      await fs.access(this.hashPath);
      const infoFile: DropsInfoFile = JSON.parse(await fs.readFile(this.hashPath, 'utf-8')) as DropsInfoFile;
      return infoFile.hash !== info.hash;
    } catch (ex) {
      // Info file doesn't exist, so we need an update
      return true;
    }
  }

  /**
   * Writes both game and drop version metadata
   * @param {number} timestamp Timestamp the build was started at
   */
  async writeVersion(timestamp: number): Promise<void> {
    const patchLogsReq = await fetch(Config.warframePatchlogsUrl);
    if (!patchLogsReq.ok) {
      logger.error('Failed to fetch patchlogs');
      return;
    }
    const patchlogs = (await patchLogsReq.json()) as unknown as PatchData[];

    // Shamelessly stolen from https://github.com/WFCD/warframe-items/blob/master/build/build.js
    // (MIT License: https://github.com/WFCD/warframe-items/blob/master/LICENSE)
    const version: string = patchlogs[0].name
      .replace(/ \+ /g, '--')
      .replace(/[^0-9\-.]/g, '')
      .trim();

    const hashReq = await fetch(Config.warframeRelicDropInfoUrl);
    if (!hashReq.ok) {
      logger.error('Failed to fetch hashInfo');
      return;
    }
    const hashInfo = (await hashReq.json()) as unknown as DropsInfo;
    const versionInfo = { version, title: patchlogs[0].name };

    const hashFile = { hash: hashInfo.hash, deUpdated: hashInfo.modified, timestamp };
    await fs.writeFile(this.hashPath, JSON.stringify(hashFile, undefined, 2), 'utf-8');
    await fs.writeFile(this.versionPath, JSON.stringify(versionInfo, undefined, 2), 'utf-8');
    await fs.writeFile(this.versionRawPath, version, 'utf-8');
    logger.debug('Finished writing version info');
  }
}

export default VersionManager;
