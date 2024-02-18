import chai from 'chai';

import { Generator } from '..';

chai.should();

describe('Build', () => {
  it('should not throw on construction', () => {
    (() => {
      // eslint-disable-next-line no-new
      new Generator();
    }).should.not.throw();
  });
});
