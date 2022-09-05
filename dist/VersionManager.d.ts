declare class VersionManager {
    versionPath: string;
    versionRawPath: string;
    hashPath: string;
    /**
     * Creates a new VersionManager instance.
     * @param dataDir Folder to write version information to.
     */
    constructor(dataDir?: string);
    /**
     * Checks if the current data needs an update
     */
    updateNeeded(): Promise<boolean>;
    /**
     * Writes both game and drop version metadata
     * @param timestamp Timestamp the build was started at
     */
    writeVersion(timestamp: number): Promise<void>;
}
export { VersionManager };
