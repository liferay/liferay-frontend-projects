// "fs": "fs-browser",
// "jss": "./my-jss",
// "is-object": "./my-is-object.js",
// "./util": "fancy-util",
// "./model": "./browser/model",
// "./things": "./browser/things.js",
// "./display.js": "react",
// "./platform.js": "./browser/platform",
// "./random.js": "./browser/random.js"

module.exports = () => {
	console.log(`
require('fs')`);
	console.group();
	require('fs')();
	console.groupEnd();

	console.log(`
require('jss')`);
	console.group();
	require('jss')();
	console.groupEnd();

	console.log(`
require('is-object')`);
	console.group();
	require('is-object')();
	console.groupEnd();

	console.log(`
require('./util')`);
	console.group();
	require('./util')();
	console.groupEnd();

	console.log(`
require('./model')`);
	console.group();
	require('./model')();
	console.groupEnd();

	console.log(`
require('./things')`);
	console.group();
	require('./things')();
	console.groupEnd();

	console.log(`
require('./display.js')`);
	console.group();
	require('./display.js')();
	console.groupEnd();

	console.log(`
require('./platform.js')`);
	console.group();
	require('./platform.js')();
	console.groupEnd();

	console.log(`
require('./random.js')`);
	console.group();
	require('./random.js')();
	console.groupEnd();
};
