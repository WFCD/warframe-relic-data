import chai from 'chai';

chai.should();

describe('Build', () => {
  it('should not throw on construction', async () => {
    const { Generator } = await import('..');
    (() => {
      const generator = new Generator();
      chai.expect(generator).to.be.an.instanceof(Generator);
    }).should.not.throw();
  });
});
