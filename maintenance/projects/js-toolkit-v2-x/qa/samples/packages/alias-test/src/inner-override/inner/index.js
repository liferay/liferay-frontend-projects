// "is-object": "./my-is-object.js",
// "./replaced.js": "./browser/replaced.js"

module.exports = () => {
	console.log(`
require('is-object')`);
	console.group();
	require('is-object')();
	console.groupEnd();

	console.log(`
require('./replaced.js')`);
	console.group();
	require('./replaced.js')();
	console.groupEnd();

	console.log(`
require('../is-object')`);
	console.group();
	require('../is-object')();
	console.groupEnd();
};
