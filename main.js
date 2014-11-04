'use strict';

var config = require('./config/config.js');

var DependencyBuilder = require('./src/dependency-builder.js');
var URLBuilder = require('./src/url-builder.js');

var depBuilder = new DependencyBuilder(config);

var urlBuilder = new URLBuilder(config);

var res = depBuilder.resolve('aui-dialog');
console.log('Dependencies', res.join());

res = urlBuilder.build(res);
console.log('URL', res);

res = depBuilder.resolve(['aui-autocomplete']);
console.log('Dependencies', res.join());

res = urlBuilder.build(res);
console.log('URL', res);

res = depBuilder.resolve('aui-node', 'aui-plugin-base');
console.log('Dependencies', res.join());

res = urlBuilder.build(res);
console.log('URL', res);

res = depBuilder.resolve('aui-nate');
console.log('Dependencies', res.join());

res = urlBuilder.build(res);
console.log('URL', res);