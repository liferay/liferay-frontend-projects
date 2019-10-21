var path = require('path');
var rimraf = require('rimraf');

rimraf.sync(path.join(__dirname, '../build'));
rimraf.sync(path.join(__dirname, '../dist'));
