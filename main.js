'use strict';

var config = require('./config/config.js');

var DependencyBuilder = require('./src/dependency-builder.js');

var depBuilder = new DependencyBuilder(config);

var res = depBuilder.resolve(['aui-dialog']);

console.log(res.join());

var res = depBuilder.resolve(['aui-autocomplete']);

console.log(res.join());