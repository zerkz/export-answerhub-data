/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
const { expect } = require('chai');
const sinon = require('sinon');
const rewire = require('rewire');
// mock/stub dependencies.
const fs = require('fs');
// system to be tested.
const lib = rewire('../lib');
// mock data
const mockQuestionData = JSON.parse(fs.readFileSync('./test/testQuestionData.json', { encoding: 'utf8' }));

const mockQuestionsResponse = {
  status: 200,
  data: mockQuestionData,
};

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});


const DEMO_HOST = 'apidocs.cloud.answerhub.com';
const DEMO_USER = 'answerhub';
const DEMO_PASSWORD = 'test123';

let fakeWriteFileSync;
let fakeGetQuestions;

describe('lib.js', function () {
  describe('#generateReqConfig', () => {
    it('generates a correct config ', () => {
      const config = lib.generateReqConfig(DEMO_HOST, DEMO_USER,
        DEMO_PASSWORD, { pageSize: 1 });
      expect(typeof config.fullURL).to.equal('object');
      expect(config.url).to.contain('question.json');
      expect(config.method).to.equal('get');
    });
  });

  describe('#getQuestionDataToFile()', () => {
    let rewireRestore;
    beforeEach(() => {
      fakeWriteFileSync = sinon.stub(fs, 'writeFileSync');
      fakeGetQuestions = sinon.fake.resolves([mockQuestionsResponse]);
      rewireRestore = lib.__set__('getQuestions', fakeGetQuestions);
    });

    afterEach(() => {
      rewireRestore();
    });

    it('gets mocked data and mock writes a CSV file', function () {
      return lib.getQuestionDataToFile(DEMO_HOST, DEMO_USER, DEMO_PASSWORD, { fileType: 'csv' }).then((result) => {
        const { fileName } = result;
        sinon.assert.calledOnce(fakeGetQuestions);
        sinon.assert.calledOnce(fakeWriteFileSync);
        expect(fileName).to.contain('csv');
      });
    });
    it('gets mocked data and mock writes a JSON file ', function () {
      return lib.getQuestionDataToFile(DEMO_HOST, DEMO_USER, DEMO_PASSWORD, { fileType: 'json' }).then((result) => {
        const { fileName } = result;
        sinon.assert.calledOnce(fakeGetQuestions);
        sinon.assert.calledOnce(fakeWriteFileSync);
        expect(fileName).to.contain('json');
      });
    });
    it('gets mocked data and throws an exception when given a bad file format.', function () {
      return lib.getQuestionDataToFile(DEMO_HOST, DEMO_USER, DEMO_PASSWORD, { fileType: 'xml' }).then(() => {
        sinon.assert.fail('Did not throw an exception for invalid file format.');
      }).catch((err) => {
        expect(err.message).to.equal('Unknown Format Passed into getQuestionDataToFile : format - xml');
      });
    });
    it('gets mocked data, filters the data within date range, and writes the file', function () {
      const start = new Date(1550762617000);
      const end = new Date(1550762619000);

      return lib.getQuestionDataToFile(DEMO_HOST, DEMO_USER, DEMO_PASSWORD, {
        fileType: 'json',
        start,
        end,
      }).then((result) => {
        const { fileName } = result;
        sinon.assert.calledOnce(fakeGetQuestions);
        sinon.assert.calledOnce(fakeWriteFileSync);
        const writtenData = JSON.parse(fakeWriteFileSync.args[0][1]);
        
        expect(writtenData.every((x) => {
          const created = new Date(x.creationDate);
          return created >= start && created <= end;
        })).to.equals(true);
        expect(fileName).to.contain('json');
      });
    });

    it('gets mocked data, filters the data within an insanely early date range which results in no questions, and does not write a file.', function () {
      const start = new Date(1000);
      const end = new Date(2000);

      return lib.getQuestionDataToFile(DEMO_HOST, DEMO_USER, DEMO_PASSWORD, {
        fileType: 'json',
        start,
        end,
      }).then((result) => {
        const { questionsCount, fileName } = result;
        sinon.assert.calledOnce(fakeGetQuestions);
        expect(fileName).to.equal(undefined);
        expect(questionsCount).to.equal(0);
      });
    });
  });

  // integration tests (hit demo API)
  describe('#getQuestions()', () => {
    it('INTEGRATION: gets a 1 item response from demo API', function () {
      this.timeout(20000);
      const basicConfig = lib.generateReqConfig(DEMO_HOST, DEMO_USER,
        DEMO_PASSWORD, { pageSize: 15 });
      return lib.getQuestions(basicConfig).then((resps) => {
        const firstResponse = resps[0];
        expect(firstResponse.status).to.equal(200);
        expect(firstResponse.data.list.length).to.be.greaterThan(0);
      });
    });
  });
});
