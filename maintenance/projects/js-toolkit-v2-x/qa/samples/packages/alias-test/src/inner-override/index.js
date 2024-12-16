// "is-object": "./my-is-object.js",
// "./inner/replaced.js": "./browser/replaced.js"

module.exports = () => {
	console.log(`
require('is-object')`);
	console.group();
	require('is-object')();
	console.groupEnd();

	console.log(`
require('./inner/is-object')`);
	console.group();
	require('./inner/is-object')();
	console.groupEnd();

	console.log(`
require('./inner/replaced.js')`);
	console.group();
	require('./inner/replaced.js')();
	console.groupEnd();

	console.log(`
require('./inner')`);
	console.group();
	require('./inner')();
	console.groupEnd();
};
