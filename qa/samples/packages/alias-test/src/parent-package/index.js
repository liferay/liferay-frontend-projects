module.exports = () => {
	console.log(`
require('./test/inner/deep');`);
	console.group();
	require('./test/inner/deep')();
	console.groupEnd();
};
