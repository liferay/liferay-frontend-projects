module.exports = () => {
	console.log(`
require('is-object')`);
	console.group();
	require('is-object')();
	console.groupEnd();

	console.log(`
require('../../is-object')`);
	console.group();
	require('../../is-object')();
	console.groupEnd();
};
