const path = require('path'),
  mamp = require('../');

const server = mamp();
server.start({
  documentRoot: path.resolve(__dirname, '..')
})
.then(function(){
  console.log('started');
  return server.stop();
})
.then(function(){
  console.log('stopped');
  return server.start({
    documentRoot: path.resolve(__dirname, '..')
  });
})
.then(function(){
  console.log('started');
  return server.stop();
})
.then(function(){
  console.log('stopped');
});
