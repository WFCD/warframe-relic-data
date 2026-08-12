import chai from 'chai';

import { Generator } from '../Generator';
import { WFCDItem } from '../Types';

chai.should();
const { expect } = chai;

describe('Generator reward uniqueNames', () => {
  it('uses WFM gameRef for tradable rewards and sparse index for specials', () => {
    const generator = new Generator();

    generator.relicsRaw = [
      {
        _id: 'relic-1',
        relicName: 'A1',
        rewards: [
          {
            _id: 'r1',
            chance: 11,
            itemName: 'Akstiletto Prime Barrel',
            rarity: 'Uncommon',
          },
          {
            _id: 'r2',
            chance: 11,
            itemName: '1200X Kuva',
            rarity: 'Uncommon',
          },
          {
            _id: 'r3',
            chance: 25.33,
            itemName: 'Forma Blueprint',
            rarity: 'Uncommon',
          },
        ],
        state: 'Intact',
        tier: 'Axi',
      },
    ];

    generator.wfmItems = {
      data: [
        {
          gameRef: '/Lotus/Types/Recipes/Weapons/WeaponParts/AkstilettoPrimeBarrel',
          i18n: { en: { name: 'Akstiletto Prime Barrel', thumb: '' } },
          id: 'wfm-barrel',
          slug: 'akstiletto_prime_barrel',
        },
        {
          gameRef: '/Lotus/Types/Game/Projections/T4VoidProjectionEBronze',
          i18n: { en: { name: 'Axi A1 Relic', thumb: '' } },
          id: 'wfm-relic',
          slug: 'axi_a1_relic',
        },
      ],
    };

    generator.wfcdItems = [
      {
        drops: [],
        name: 'Axi A1 Intact',
        uniqueName: '/Lotus/Types/Game/Projections/T4VoidProjectionEBronze',
      },
    ] as WFCDItem[];

    generator.itemUniqueNames = new Map([
      ['forma blueprint', '/Lotus/Types/Recipes/Components/FormaBlueprint'],
      ['kuva', '/Lotus/Types/Items/MiscItems/Kuva'],
    ]);

    generator.generateTitaniaRelics();

    expect(generator.relics).to.have.length(1);
    const [relic] = generator.relics;
    expect(relic.uniqueName).to.equal('/Lotus/Types/Game/Projections/T4VoidProjectionEBronze');
    expect(relic.rewards[0].item.uniqueName).to.equal('/Lotus/Types/Recipes/Weapons/WeaponParts/AkstilettoPrimeBarrel');
    expect(relic.rewards[0].item.warframeMarket).to.deep.equal({
      id: 'wfm-barrel',
      urlName: 'akstiletto_prime_barrel',
    });
    expect(relic.rewards[1].item.uniqueName).to.equal('/Lotus/Types/Items/MiscItems/Kuva');
    expect(relic.rewards[1].item.warframeMarket).to.equal(undefined);
    expect(relic.rewards[2].item.uniqueName).to.equal('/Lotus/Types/Recipes/Components/FormaBlueprint');
  });

  it('does not copy relic Projection uniqueName onto rewards', () => {
    const generator = new Generator();
    const projection = '/Lotus/Types/Game/Projections/T4VoidProjectionEBronze';

    generator.relicsRaw = [
      {
        _id: 'relic-1',
        relicName: 'A1',
        rewards: [
          {
            _id: 'r1',
            chance: 11,
            itemName: 'Akstiletto Prime Barrel',
            rarity: 'Uncommon',
          },
        ],
        state: 'Intact',
        tier: 'Axi',
      },
    ];
    generator.wfmItems = {
      data: [
        {
          gameRef: '/Lotus/Types/Recipes/Weapons/WeaponParts/AkstilettoPrimeBarrel',
          i18n: { en: { name: 'Akstiletto Prime Barrel', thumb: '' } },
          id: 'wfm-barrel',
          slug: 'akstiletto_prime_barrel',
        },
        {
          gameRef: projection,
          i18n: { en: { name: 'Axi A1 Relic', thumb: '' } },
          id: 'wfm-relic',
          slug: 'axi_a1_relic',
        },
      ],
    };
    generator.wfcdItems = [
      {
        name: 'Axi A1 Intact',
        uniqueName: projection,
      },
    ] as WFCDItem[];

    generator.generateTitaniaRelics();

    expect(generator.relics[0].uniqueName).to.equal(projection);
    expect(generator.relics[0].rewards[0].item.uniqueName).to.not.equal(projection);
    expect(generator.relics[0].rewards[0].item.uniqueName).to.include('/Recipes/');
  });
});
