#!/usr/bin/env node

var mamp = require('../lib/mamp'),
  server = mamp();

var argv = require('yargs')
  .usage('Usage: mamp [options]')
  .example('mamp --documentRoot ~/Documents/htdocs', 'starts a MAMP server, hosting a htdocs folder inside your Documents')
  .help('h')
  .alias('h', 'help')
  .default('documentRoot', server.defaults.documentRoot)
  .describe('documentRoot', 'The document root for Apache')
  .default('startScript', server.defaults.startScript)
  .describe('startScript', 'The location of the MAMP start script')
  .default('stopScript', server.defaults.stopScript)
  .describe('stopScript', 'The location of the MAMP stop script')
  .default('apacheConfig', server.defaults.apacheConfig)
  .describe('apacheConfig', 'The location of the Apache httpd.conf config file')
  .argv;


/*
startScript: '/Applications/MAMP/bin/start.sh',
stopScript: '/Applications/MAMP/bin/stop.sh',
apacheConfig: '/Applications/MAMP/conf/apache/httpd.conf'
*/

var exitHandler = function(options, err) {
  server.stop();
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
};

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


server.start({
  documentRoot: argv.documentRoot
});
