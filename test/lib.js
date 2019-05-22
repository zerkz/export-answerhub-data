/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const { expect } = require('chai');

const { getQuestions, generateReqConfig } = require('../lib');

describe('lib.js', function () {
  describe('#generateReqConfig', () => {
    it('generates a correct config ', () => {
      const config = generateReqConfig('apidocs.cloud.answerhub.com', 'answerhub', 'test123', { pageSize: 1 });
      expect(typeof config.fullURL).to.equal('object');
      expect(config.url).to.contain('question.json');
      expect(config.method).to.equal('get');
    });
  });
  describe('#getQuestions()', () => {
    it('gets a 1 page response with some items ', function () {
      this.timeout(20000);
      const basicConfig = generateReqConfig('apidocs.cloud.answerhub.com', 'answerhub', 'test123', { pageSize: 1 });
      return getQuestions(basicConfig).then((resps) => {
        const firstResponse = resps[0];
        expect(firstResponse.status).to.equal(200);
        expect(firstResponse.data.list.length).to.be.greaterThan(0);
        console.log('resolved');
      });
    });
  });
});
