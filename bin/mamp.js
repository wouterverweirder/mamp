#!/usr/bin/env node

var mamp = require('../lib/mamp'),
  server = mamp();

var argv = require('yargs')
  .usage('Usage: mamp <documentRoot> [options]')
  .example('mamp .', 'starts a MAMP server hosting your current directory')
  .example('mamp ~/Documents/htdocs', 'starts a MAMP server, hosting a htdocs folder inside your Documents')
  .help('h')
  .alias('h', 'help')
  .alias('p', 'port')
  .default('port', server.defaults.port)
  .describe('port', 'The port to bind Apache to')
  .default('startScript', server.defaults.startScript)
  .describe('startScript', 'The location of the MAMP start script')
  .default('stopScript', server.defaults.stopScript)
  .describe('stopScript', 'The location of the MAMP stop script')
  .default('apacheConfig', server.defaults.apacheConfig)
  .describe('apacheConfig', 'The location of the Apache httpd.conf config file')
  .argv;

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


var documentRoot = server.defaults.documentRoot;
if(argv._.length > 0) {
  documentRoot = argv._[0];
}
server.on('stop', function() {
  console.log('[MAMP] stopped');
});
server.start({
  documentRoot: documentRoot,
  port: argv.port,
  startScript: argv.startScript,
  stopScript: argv.stopScript,
  apacheConfig: argv.apacheConfig,
})
.then(function(){
  console.log('[MAMP] started');
});
