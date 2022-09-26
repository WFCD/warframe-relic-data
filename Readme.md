# warframe-relic-data (@wfcd/relics)

[![GitHub license](https://img.shields.io/github/license/WFCD/warframe-relic-data?style=for-the-badge)](https://github.com/WFCD/warframe-relic-data/blob/master/License)
[![Warframe Version](https://img.shields.io/badge/dynamic/json?color=blueviolet&label=Warframe%20Version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2FWFCD%2Fwarframe-relic-data%2Fdevelopment%2Fdata%2Fversion.json&style=for-the-badge)](https://github.com/WFCD/warframe-relic-data/blob/development/data/version.json)

## Information

This repository is part of the build process for [warframe-items](https://github.com/WFCD/warframe-items), 
but it does work standalone too.
So far this repository is probably not complete and is not stable.
No build is automatically ran either, so the data is probably quite outdated.

## Data Types

Currently the data is found in [Relics.json](/data/Relics.json) and [Relics.min.json](/data/Relics.min.json).

Types are available as Typescript types.
[Relics.json](/data/Relics.json) is an array of [TitaniaRelic](/src/Types.ts)

## Manually building
```bash
npm install
npm start
```
Afterwards the data should be available in [/data/Relics.json](/data/Relics.json)

## Integrating into a different build process

For integration it is recommended to use the [Generator](/src/Generator.ts) directly.
A very simple example:

```ts
import { Generator } from "warframe-relic-data";

const generator = new Generator();

await generator.generate();
await generator.writeData("./", "Relic", true);
```
The generated data would now be in `./Relic.json` and `./Relic.min.json`.

As alternative, `Generator.generate()` returns the full relic data array directly for use in other modules.

For conviniece this module provides a version checker, which can determine if any of api data is updated.

Example:

```ts
import { VersionManager } from "warframe-relic-data";

const manager = new VersionManager("./");

const needsUpdate = await manager.updateNeeded(); // true if needed

```

A more complete example (using the default [./data/](./data/) directory) can be found here: [Example](./src/Build.ts)

## Credits

- [warframe-items](https://github.com/WFCD/warframe-items) License: [MIT](https://github.com/WFCD/warframe-items/blob/master/LICENSE)
- [warframe-drop-data](https://github.com/WFCD/warframe-drop-data) License: [MIT](https://github.com/WFCD/warframe-drop-data/blob/main/LICENSE)
- [warframe-patchlogs](https://github.com/WFCD/warframe-patchlogs) License: [MIT](https://github.com/WFCD/warframe-patchlogs/blob/master/LICENSE)
- [warframe.market](https://warframe.market)
- [Warframe Drop Tables](https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html)
- [node-fetch](https://github.com/node-fetch/node-fetch/tree/2.x) License: [MIT](https://github.com/node-fetch/node-fetch/blob/2.x/LICENSE.md)

Thanks !

## License

[MIT](/License)
