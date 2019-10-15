module.exports = () => {
	console.log(`
require('./test/is-object');`);
	console.group();
	require('./test/is-object')();
	console.groupEnd();

	console.log(`
require('./test/is-object.js');`);
	console.group();
	require('./test/is-object.js')();
	console.groupEnd();
};
