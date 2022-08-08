# warframe-relic-data

[![GitHub license](https://img.shields.io/github/license/TitaniaProject/warframe-relic-data?style=for-the-badge)](https://github.com/TitaniaProject/warframe-relic-data/blob/master/License)
[![Warframe Version](https://img.shields.io/badge/dynamic/json?color=blueviolet&label=Warframe%20Version&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2FTitaniaProject%2Fwarframe-relic-data%2Fdevelopment%2Fdata%2Fversion.json&style=for-the-badge)](https://github.com/TitaniaProject/warframe-relic-data/blob/development/data/version.json)

## Information

This version is mainly a proof of concept for potentially being added into [WFCD/warframe-items](https://github.com/WFCD/warframe-items).
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