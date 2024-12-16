// "react": "./browser/react.js",
// "react/path/to/module": "./browser/react-module.js"

module.exports = () => {
	console.log(`
require('react')`);
	console.group();
	require('react')();
	console.groupEnd();

	console.log(`
require('react/path/to/module')`);
	console.group();
	require('react/path/to/module')();
	console.groupEnd();

	console.log(`
require('./inner')`);
	console.group();
	require('./inner')();
	console.groupEnd();
};
