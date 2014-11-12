'use strict';

var config = require('./src/config/config.js');

var DependencyBuilder = require('./src/js/dependency-builder.js');
var URLBuilder = require('./src/js/url-builder.js');

var depBuilder = new DependencyBuilder(config);

var urlBuilder = new URLBuilder(config);

var alreadyLoadedModules = [];

var dependencies = depBuilder.resolve('aui-dialog');
console.log('Dependencies', dependencies.join());

var url = urlBuilder.build(dependencies);
console.log('URL', url);

// Load the modules here

alreadyLoadedModules = alreadyLoadedModules.concat(dependencies);

dependencies = depBuilder.resolve(['aui-autocomplete']);
console.log('Dependencies', dependencies.join());

url = urlBuilder.build(dependencies, alreadyLoadedModules);
console.log('URL', url);

// Load the modules here

alreadyLoadedModules = alreadyLoadedModules.concat(dependencies);


// dependencies = depBuilder.resolve('aui-node', 'aui-plugin-base');
// console.log('Dependencies', dependencies.join());

// url = urlBuilder.build(dependencies);
// console.log('URL', url);

// dependencies = depBuilder.resolve('aui-nate');
// console.log('Dependencies', dependencies.join());

// url = urlBuilder.build(dependencies);
// console.log('URL', url);