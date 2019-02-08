const axios = require('axios');
const cli = require('commander');
const colors = require('colors');
const Json2csvParser = require('json2csv').Parser;

const csvParser = new Json2csvParser({
  flatten: true,
});
const fs = require('fs');


function parseList(val) {
  return val.split(',');
}

function errorAndExit(msg) {
  console.error(colors.red(msg));
  cli.help();
}

let host;
let username;
let password;
let start;
let end;

cli.version('1.0.0')
  .arguments('<host> <username> <password> [start] [end]')
  .option('-t, --topics <topics>', 'A comma separated list of topics to filter questions by. If multiple topics are supplied, the question must be ALL topics to be returned.', parseList)
  .option('-s, --space <space>', 'Filter by questions belonging to a certain space. ')
  .option('-p, --page-size <pageSize>', 'The page size to use for each request. Lower it if the tool seems to fail or be slow.', parseInt, 15)
  .option('-f, --file-type [format]', 'Export the data in a particular format')
  .action((hostVal, usernameVal, passwordVal, startTime, endTime) => {
    host = hostVal;
    username = usernameVal;
    password = passwordVal;
    if (startTime) start = Date.parse(startTime);
    if (endTime) end = (endTime && Date.parse(endTime)) || Date.now();
  })
  .on('--help', () => {
    console.log('');
    console.log('[start] and [end] represent date range filters.');
    console.log('They must be provided in ISO-8061 format.');
    console.log('Examples:');
    console.log('  2008-09-15');
    console.log('  2008-09-15T15:53:00');
    console.log('  2008-09-15T15:53:00+05:00');
  })
  .parse(process.argv);
// validate
if (!host) errorAndExit('No host was provided. Please provide the hostname of your Answerhub server. Ex. apidocs.cloud.answerhub.com');
if (!username) errorAndExit('No username was provided');
if (!password) errorAndExit('No password was provided');
if (start !== undefined && isNaN(start)) errorAndExit('Start time could not be parsed. Ensure it is in ISO-8061 format.');
if (end !== undefined && isNaN(end)) errorAndExit('End time could not be parsed. Ensure it is in ISO-8061 format.');
if (start >= end) errorAndExit('Start time must be before the end time.');

// prepare URL/Query
const requestURL = new URL(`https://${host}/services/v2/question.json`);
requestURL.searchParams.append('pageSize', cli.pageSize);

if (cli.space) requestURL.searchParams.append('space', cli.space);
if (cli.topics) requestURL.searchParams.append('topics', cli.topics.join(','));

let questionList = [];

const reqConfig = {
  url: requestURL.href,
  method: 'get',
  auth: {
    username,
    password,
  },
  responseType: 'json',
  validateStatus: false,
};

function genCallQuestionListPaginated(page) {
  requestURL.searchParams.set('page', page);
  reqConfig.url = requestURL.href;
  return axios(reqConfig);
}

axios(reqConfig) // get first page.
  .then((resp) => {
    questionList = questionList.concat(resp.data.list);
    const paginatedRequests = [];
    for (let i = 2; i <= resp.data.pageCount; i += 1) {
      paginatedRequests.push(genCallQuestionListPaginated(i));
    }
    return Promise.all(paginatedRequests);
  })
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
    console.log('error');
    console.log(err);
  });
