const fs = require('fs');

const axios = require('axios');
const colors = require('colors');
const Json2csvParser = require('json2csv').Parser;

const csvParser = new Json2csvParser({
  flatten: true,
});

const generateReqConfig = (host, username, password, options) => {
  const opts = options || {};
  const requestURL = new URL(`https://${host}/services/v2/question.json`);
  if (opts.space) requestURL.searchParams.append('space', opts.space);
  if (opts.topics) requestURL.searchParams.append('topics', opts.topics);
  if (opts.pageSize) requestURL.searchParams.append('pageSize', opts.pageSize);

  const reqConfig = {
    url: requestURL.href,
    method: 'get',
    auth: {
      username,
      password,
    },
    responseType: 'json',
    validateStatus: false,
    fullURL: requestURL,
  };
  return reqConfig;
};

const getQuestions = (reqConfig) => {
  const config = reqConfig;
  return axios(config) // get first page.
    .then((resp) => {
      const paginatedRequests = [];
      // insert contents of first page as resolved promise.
      paginatedRequests.push(Promise.resolve(resp));

      // knowing how many pages remain, call to get contents for each.
      for (let i = 2; i <= resp.data.pageCount; i += 1) {
        config.fullURL.searchParams.set('page', i);
        config.url = config.fullURL.href;
        // add promises for extra page.
        paginatedRequests.push(axios(config));
      }
      // wait for all promises to complete.
      return Promise.all(paginatedRequests);
    });
};

const getQuestionDataToCSV = (host, username, password, options) => {
  const reqConfig = generateReqConfig(host, username, password, options);
  let questionList = [];
  getQuestions(reqConfig)
    .then((responses) => {
      responses.forEach((resp) => {
        if (resp.status === 200) {
          questionList = questionList.concat(resp.data.list);
        } else {
          console.error(colors.red(`${resp.config.url} returned status code: ${resp.status}`));
        }
      });
      const csv = csvParser.parse(questionList);
      const csvFilename = `data_export${Date.now()}.csv`;
      fs.writeFileSync(csvFilename, csv);
      console.log(colors.green(`Wrote ${csvFilename} to disk.`));
    }).catch((err) => {
      console.error('error');
      console.error(err);
    });
};

module.exports = {
  getQuestionDataToCSV,
  getQuestions,
  generateReqConfig,
}
