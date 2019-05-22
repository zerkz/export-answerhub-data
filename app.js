#!/usr/bin/env node
const cli = require('commander');
const colors = require('colors');
const { getQuestionDataToFile, FILE_FORMATS } = require('./lib');

function parseList(val) {
  return val.split(',');
}

function errorAndExitWithHelp(msg) {
  console.error(colors.red(msg));
  cli.help();
  process.exit();
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
  .option('-f, --file-type <format>', `Export the data in a particular format (default is csv). \n\t Formats available: ${FILE_FORMATS.join(',')}`)
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
if (!host) errorAndExitWithHelp('No host was provided. Please provide the hostname of your Answerhub server. Ex. apidocs.cloud.answerhub.com');
if (!username) errorAndExitWithHelp('No username was provided');
if (!password) errorAndExitWithHelp('No password was provided');
if (start !== undefined && isNaN(start)) errorAndExitWithHelp('Start time could not be parsed. Ensure it is in ISO-8061 format.');
if (end !== undefined && isNaN(end)) errorAndExitWithHelp('End time could not be parsed. Ensure it is in ISO-8061 format.');
if (start >= end) errorAndExitWithHelp('Start time must be before the end time.');

const options = {
  pageSize: cli.pageSize,
  fileType: cli.fileType || 'csv',
};

if (cli.space) options.space = cli.space;
if (cli.topics) options.topics = cli.topics.join(',');
if (cli.fileType && !FILE_FORMATS.includes(cli.fileType)) {
  errorAndExitWithHelp('Invalid File Format provided.');
}

getQuestionDataToFile(host, username, password, options).then(
  fileName => console.log(colors.green(`Wrote ${fileName} to disk.`)),
).catch(err => console.log(colors.red(err)));
