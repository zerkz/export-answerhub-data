const axios = require('axios');
const cli = require('commander');
const colors = require('colors');

function parseList(val) {
  return val.split(',');
}

function errorAndExit(msg) {
  console.error(colors.red(msg));
  cli.outputHelp();
  process.exitCode = 1;
}

let host;
let username;
let password;
let start;
let end;

cli.version('1.0.0')
  .arguments('<host> <username> <password> [start] [end]')
  .option('-t, --topics <topics>', 'A comma separated list of topics to filter questions by..', parseList)
  .option('-s, --space <space>', 'Filter by questions belonging to a certain space. ')
  .option('-p, --page-size <pageSize>', 'The page size to use for each request. Lower it if the tool seems to fail or be slow.', parseInt)
  .option('-f, --file-type [format]', 'Export the data in a particular format')
  .action((hostVal, usernameVal, passwordVal, startTime, endTime) => {
    host = hostVal;
    username = usernameVal;
    password = passwordVal;
    start = Date.parse(startTime);
    end = (endTime && Date.parse(endTime)) || Date.now();
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

if (!process.argv.slice(2).length) {
  cli.outputHelp();
}

if (!host) errorAndExit('No host was provided. Please provide the hostname of your Answerhub server. Ex. https://apidocs.cloud.answerhub.com/');
if (!username) errorAndExit('No username was provided');
if (!password) errorAndExit('No password was provided');
if (isNaN(start)) errorAndExit('Start time could not be parsed. Ensure it is in ISO-8061 format.');
if (isNaN(end)) errorAndExit('End time could not be parsed. Ensure it is in ISO-8061 format.');
if (start >= end) errorAndExit('Start time must be before the end time.');
