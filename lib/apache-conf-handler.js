var fs = require('fs');

var apacheConfHandler = function() {
  var self = this;
  var emptyCb = function(){
    return function(){};
  };
  self.originalConfig = false;
  self.updatedConfig = false;
  self.readConfig = function(filePath, cb) {
    cb = cb || emptyCb();
    fs.readFile(filePath, 'utf8', function(err, data){
      if(err) {
        cb(err, null);
        return;
      }
      self.originalConfig = data;
      self.updatedConfig = self.originalConfig;
      cb(null, self.originalConfig);
    });
  };
  self.setValue = function(key, value, cb) {
    cb = cb || emptyCb();
    if(!self.updatedConfig) {
      cb('config not loaded yet');
      return;
    }
    var search = new RegExp(key + ' (.*)', 'g');
    var searchResult = search.exec(self.updatedConfig);
    if(!searchResult) {
      cb('Unknown config value: ' + key);
      return;
    }
    self.updatedConfig = self.updatedConfig.replace(search, key + ' ' + value);
    //in case of DocumentRoot: replace all occurencies
    if(key === 'DocumentRoot') {
      self.updatedConfig = self.updatedConfig.replace(new RegExp(searchResult[1], 'g'), value);
    }
  };
  self.saveUpdatedConfig = function(filePath, cb) {
    cb = cb || emptyCb();
    if(!self.updatedConfig) {
      cb('config not loaded yet');
      return;
    }
    fs.writeFile(filePath, self.updatedConfig, cb);
  };
  self.restoreOriginalConfig = function(filePath) {
    if(!self.originalConfig) {
      return;
    }
    fs.writeFileSync(filePath, self.originalConfig);
  };
  return self;
};

module.exports = apacheConfHandler;
