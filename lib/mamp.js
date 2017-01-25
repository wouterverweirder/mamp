var path = require('path'),
  util = require('util'),
  events = require('events');

require('es6-promise').polyfill();

var mamp = function(){
  var self = this;
  var emitter = new events.EventEmitter();
  self.on = emitter.on;
  self.once = emitter.once;
  self.emit = emitter.emit;
  self.removeListener = emitter.removeListener;
  self.removeAllListeners = emitter.removeAllListeners;
  var apacheConfHandler = require('./apache-conf-handler')();
  self.running = false;
  self.defaults = {
    documentRoot: process.cwd(),
    port: 8888,
    startScript: '/Applications/MAMP/bin/start.sh',
    stopScript: '/Applications/MAMP/bin/stop.sh',
    apacheConfig: '/Applications/MAMP/conf/apache/httpd.conf',
    startTimeout: 5000
  };
  self._initOptions = function(options) {
    if(!options) {
      options = {};
    }
    for(var key in self.defaults) {
      if(!options[key]) {
        options[key] = self.defaults[key];
      }
    }
    //make sure documentRoot has a trailing slash
    options.documentRoot = path.resolve(options.documentRoot) + '/';
    //make sure to wrap documentRoot between double quotes
    if(options.documentRoot.charAt(0) !== '"') {
      options.documentRoot = '"' + options.documentRoot;
    }
    if(options.documentRoot.charAt(options.documentRoot.length - 1) !== '"') {
      options.documentRoot = options.documentRoot + '"';
    }
    return options;
  }
  self.start = function(options) {
    return new Promise(function(resolve){
      var seq = Promise.resolve();
      if (self.running) {
        console.log('[MAMP] already running, stopping previous instance');
        seq = seq.then(function(){
          return self.stop();
        });
      }
      seq = seq.then(function(){
        console.log('[MAMP] starting');
        self.running = true;
        options = self._initOptions(options);
        return startImpl(options);
      });
      seq = seq.then(function(){
        self.emit('start');
        resolve();
      });
    });
  };
  var startImpl = function(options){
    return new Promise(function(resolve, reject){
      //set the documentRoot dir correctly
      apacheConfHandler.readConfig(options.apacheConfig, function(err, result){
        if(err) {
          return reject(err);
        }
        apacheConfHandler.setValue('DocumentRoot', options.documentRoot);
        apacheConfHandler.setValue('Listen', options.port);
        apacheConfHandler.setValue('ServerName', 'localhost:' + options.port);
        apacheConfHandler.saveUpdatedConfig(options.apacheConfig, function(err){
          if(err) {
            return reject(err);
          }
          var serverRunner = require('child_process').spawn(options.startScript);
          serverRunner.stdout.on('data', function(data){
            var str = data.toString().trim();
            console.log('[MAMP]', str);
          });
          serverRunner.stderr.on('data', function(data){
            var str = data.toString().trim();
            console.log('[MAMP] error:', str);
          });
          serverRunner.on('close', function(){
            self.emit('stop');
          });
          //TMP: resolve after timeout
          setTimeout(function(){
            resolve();
          }, options.startTimeout);
        });
      });
    });
  };
  self.stop = function(options) {
    return new Promise(function(resolve){
      if (!self.running) {
        return resolve();
      }
      console.log('[MAMP] stopping');
      self.running = false;
      options = self._initOptions(options);
      //restore the original apache config
      apacheConfHandler.restoreOriginalConfig(options.apacheConfig);
      //listen for the stop event
      self.once('stop', function(){
        resolve();
      });
      //exec the stop script
      require('child_process').execSync(options.stopScript);
    });
  };
  return self;
};

module.exports = mamp;
