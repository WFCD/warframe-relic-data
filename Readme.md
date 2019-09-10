![Warframe Version](https://img.shields.io/badge/dynamic/json?color=blueviolet&label=Warframe%20Version&query=%24.version&url=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FTitaniaProject%2Fwarframe-relic-data%2Fdata%2Fversion.json&style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/TitaniaProject/warframe-relic-data?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/TitaniaProject/warframe-relic-data?style=for-the-badge)
![Drone (self-hosted)](https://img.shields.io/drone/build/TitaniaProject/warframe-relic-data?server=https%3A%2F%2Fci.sleepylux.xyz&style=for-the-badge)
# 📝 Warframe Relic Data

Provides easy access to every Relic in Warframe and it's drops and farm locations.

Pretty much a smaller version of [Warframe-Items](https://github.com/WFCD/warframe-items)
with some changes to make it easier to parse for that purpose. 

## Usage

```js
const relics = require("warframe-relic-data");
relics.forEach(relic => {
    console.log(relic.name);
});
```

Relic Properties:
(for more info see [Typings](index.d.ts))
```typescript
interface Relic {
    name: string;
    rewards: Reward[]
    locations: Location[];
    vaulted: boolean;
    warframeMarket: WarframeMarketId | null;
}
```

## CDN Urls

JsDelivr:
```
https://cdn.jsdelivr.net/gh/TitaniaProject/warframe-relic-data/data/Relics.min.json
```

## Credits

This library would't be possible without these projects and people. Thanks! ❤️

- [warframe-items](https://github.com/WFCD/warframe-items) License: [MIT](https://github.com/WFCD/warframe-items/blob/development/LICENSE)
- [warframe.market](https://warframe.market)
- [Warframe Official Drop Data](https://n8k6e2y6.ssl.hwcdn.net/repos/hnfvc0o3jnfvc873njb03enrf56.html)
- [Digital Extremes](https://www.warframe.com/)
- [JsDelivr](https://www.jsdelivr.com/)
