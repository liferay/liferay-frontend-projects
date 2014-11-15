'use strict';

var config = require('./src/config/config.js');

var DependencyBuilder = require('./src/js/dependency-builder.js');
var ConfigParser = require('./src/js/config-parser.js');
var URLBuilder = require('./src/js/url-builder.js');

debugger;

var configParser = new ConfigParser(config);

var depBuilder = new DependencyBuilder(configParser);
var urlBuilder = new URLBuilder(configParser);

// var dependencies = depBuilder.resolve('aui-dialog');
// console.log('Dependencies', dependencies.join());

// var url = urlBuilder.build(dependencies);
// console.log('URL', url);

// // Load the modules here

// dependencies = depBuilder.resolve(['aui-autocomplete']);
// console.log('Dependencies', dependencies.join());

// url = urlBuilder.build(dependencies);
// console.log('URL', url);

// // Load the modules here

// dependencies = depBuilder.resolve('aui-node', 'aui-plugin-base');
// console.log('Dependencies', dependencies.join());

// url = urlBuilder.build(dependencies);
// console.log('URL', url);

// dependencies = depBuilder.resolve('aui-nate');
// console.log('Dependencies', dependencies.join());

// url = urlBuilder.build(dependencies);
// console.log('URL', url);


var dependencies = depBuilder.resolve('aui-chema-group-test2', 'aui-ambrin-group-test4');
console.log('Dependencies', dependencies.join());

var url = urlBuilder.build(dependencies);
console.log('URL', url);