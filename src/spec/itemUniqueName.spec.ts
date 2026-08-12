import chai from 'chai';

import {
  buildItemUniqueNameIndex,
  normalizeRewardName,
  resolveRewardUniqueName,
  uniqueNameRank,
} from '../itemUniqueName';

chai.should();
const { expect } = chai;

describe('itemUniqueName', () => {
  describe('normalizeRewardName', () => {
    it('strips quantity prefixes', () => {
      expect(normalizeRewardName('1200X Kuva')).to.equal('Kuva');
      expect(normalizeRewardName('2X Forma Blueprint')).to.equal('Forma Blueprint');
    });

    it('leaves names without quantity prefixes alone', () => {
      expect(normalizeRewardName('Riven Sliver')).to.equal('Riven Sliver');
      expect(normalizeRewardName('Akstiletto Prime Barrel')).to.equal('Akstiletto Prime Barrel');
    });
  });

  describe('uniqueNameRank', () => {
    it('ranks Items and Recipes highest', () => {
      expect(uniqueNameRank('/Lotus/Types/Items/MiscItems/Kuva')).to.equal(3);
      expect(uniqueNameRank('/Lotus/Types/Recipes/Components/FormaBlueprint')).to.equal(3);
    });

    it('ranks Enemies lowest among Types paths', () => {
      const enemy = uniqueNameRank('/Lotus/Types/Enemies/Grineer/GhostTower/GhostAvatar');
      const kuva = uniqueNameRank('/Lotus/Types/Items/MiscItems/Kuva');
      expect(enemy).to.equal(0);
      expect(kuva).to.be.above(enemy);
    });

    it('prefers Types over StoreItems', () => {
      const types = uniqueNameRank('/Lotus/Types/Items/MiscItems/Forma');
      const store = uniqueNameRank('/Lotus/StoreItems/Types/Items/MiscItems/Forma');
      expect(types).to.be.above(store);
    });
  });

  describe('buildItemUniqueNameIndex', () => {
    it('indexes by lowercase name and prefers MiscItems Kuva over Enemy Kuva', () => {
      const index = buildItemUniqueNameIndex([
        { name: 'Kuva', uniqueName: '/Lotus/StoreItems/Types/Items/MiscItems/Kuva' },
        { name: 'Kuva', uniqueName: '/Lotus/Types/Enemies/Grineer/GhostTower/GhostAvatar' },
        { name: 'Kuva', uniqueName: '/Lotus/Types/Items/MiscItems/Kuva' },
        { name: 'Riven Sliver', uniqueName: '/Lotus/Types/Items/MiscItems/RivenFragment' },
      ]);

      expect(index.get('kuva')).to.equal('/Lotus/Types/Items/MiscItems/Kuva');
      expect(index.get('riven sliver')).to.equal('/Lotus/Types/Items/MiscItems/RivenFragment');
    });

    it('skips incomplete rows', () => {
      const index = buildItemUniqueNameIndex([
        { name: '', uniqueName: '/Lotus/Types/Items/MiscItems/Kuva' },
        { name: 'Kuva', uniqueName: '' },
        { name: 'Forma', uniqueName: '/Lotus/Types/Items/MiscItems/Forma' },
      ]);
      expect(index.size).to.equal(1);
      expect(index.get('forma')).to.equal('/Lotus/Types/Items/MiscItems/Forma');
    });
  });

  describe('resolveRewardUniqueName', () => {
    const index = new Map([
      ['forma blueprint', '/Lotus/Types/Recipes/Components/FormaBlueprint'],
      ['kuva', '/Lotus/Types/Items/MiscItems/Kuva'],
    ]);

    it('prefers WFM gameRef when present', () => {
      const gameRef = '/Lotus/Types/Recipes/Weapons/WeaponParts/AkstilettoPrimeBarrel';
      expect(resolveRewardUniqueName('Akstiletto Prime Barrel', gameRef, index)).to.equal(gameRef);
    });

    it('falls back to sparse index after normalizing quantity prefixes', () => {
      const kuva = resolveRewardUniqueName('1200X Kuva', undefined, index);
      const formaBp = resolveRewardUniqueName('2X Forma Blueprint', undefined, index);
      expect(kuva).to.equal('/Lotus/Types/Items/MiscItems/Kuva');
      expect(formaBp).to.equal('/Lotus/Types/Recipes/Components/FormaBlueprint');
    });

    it('returns empty string when unresolved', () => {
      expect(resolveRewardUniqueName('Unknown Drop', undefined, index)).to.equal('');
    });
  });
});
