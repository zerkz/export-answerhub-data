const fs = require('fs');

const axios = require('axios');
const Json2csvParser = require('json2csv').Parser;

const csvParser = new Json2csvParser({
  flatten: true,
});

const FILE_FORMATS = ['csv', 'json'];

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

const filterQuestionsWithinDateRange = (questions, start, end) => {
  if (end) {
    return questions.filter((x) => {
      const creationDate = new Date(x.creationDate);
      return (creationDate >= start && creationDate <= end);
    });
  }
  return questions.filter((x) => {
    const creationDate = new Date(x.creationDate);
    return (creationDate >= start);
  });
};


const getQuestionDataToFile = (host, username, password, options) => {
  const reqConfig = generateReqConfig(host, username, password, options);
  let questionList = [];
  return getQuestions(reqConfig)
    .then((responses) => {
      responses.forEach((resp) => {
        if (resp.status === 200) {
          questionList = questionList.concat(resp.data.list);
        } else {
          throw new Error(`Answerhub API Call ${resp.config.url} returned HTTP status code: ${resp.status}`);
        }
      });

      if (options.start) {
        questionList = filterQuestionsWithinDateRange(questionList, options.start, options.end);
      }

      if (questionList.length === 0) {
        throw new Error('No questions were found with the provided criteria. Exiting.');
      }

      let fileName = options.fileName || `data_export${Date.now()}`;
      fileName += `.${options.fileType}`;
      switch (options.fileType) {
        case 'csv':
          fs.writeFileSync(fileName, csvParser.parse(questionList));
          break;
        case 'json':
          fs.writeFileSync(fileName, JSON.stringify(questionList));
          break;
        default:
          throw new Error(`Unknown Format Passed into getQuestionDataToFile : format - ${options.fileType}`);
      }
      return Promise.resolve(fileName);
    });
};

module.exports = {
  generateReqConfig,
  getQuestions,
  getQuestionDataToFile,
  FILE_FORMATS,
  filterQuestionsWithinDateRange,
};
