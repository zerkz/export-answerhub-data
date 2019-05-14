/* eslint-disable func-names */
const { expect } = require('chai');

const { getQuestions, generateReqConfig } = require('../lib');

const basicConfig = generateReqConfig('apidocs.cloud.answerhub.com',
  'answerhub', 'test123', { pageSize: 1 });

describe('lib.js',
  () => describe('#getQuestions()',
    it('gets a 1 page response with some items ', function () {
      this.timeout(10000);
      return getQuestions(basicConfig).then((resps) => {
        const firstResponse = resps[0];
        expect(firstResponse.status).to.equal(200);
        expect(firstResponse.data.list.length).to.be.greaterThan(0);
      });
    })));
