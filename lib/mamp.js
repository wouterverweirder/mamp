var exec = require('child_process').exec,
  path = require('path');

var mamp = function(){
  var self = this;
  var apacheConfHandler = require('./apache-conf-handler')();
  self.running = false;
  self.defaults = {
    documentRoot: process.cwd(),
    startScript: '/Applications/MAMP/bin/start.sh',
    stopScript: '/Applications/MAMP/bin/stop.sh',
    apacheConfig: '/Applications/MAMP/conf/apache/httpd.conf'
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
    return options;
  }
  self.start = function(options) {
    if(self.running) {
      console.log('[MAMP] already running, stopping previous instance');
      self.stop();
    }
    console.log('[MAMP] starting');
    self.running = true;
    options = self._initOptions(options);
    //set the documentRoot dir correctly
    apacheConfHandler.readConfig(options.apacheConfig, function(err, result){
      if(err) {
        console.log(err);
        return;
      }
      apacheConfHandler.setValue('DocumentRoot', options.documentRoot);
      apacheConfHandler.saveUpdatedConfig(options.apacheConfig, function(err){
        if(err) {
          console.log(err);
          return;
        }
        exec(options.startScript, function(error, stdout, stderr){
          if(error) {
            console.log(error);
            return;
          }
          console.log('[MAMP] running');
        });
      });
    });
  };
  self.stop = function(options) {
    if(!self.running) {
      return;
    }
    console.log('[MAMP] stopping');
    self.running = false;
    options = self._initOptions(options);
    //restore the original apache config
    apacheConfHandler.restoreOriginalConfig(options.apacheConfig);
    exec(options.stopScript);
  };
  return self;
};

module.exports = mamp;
