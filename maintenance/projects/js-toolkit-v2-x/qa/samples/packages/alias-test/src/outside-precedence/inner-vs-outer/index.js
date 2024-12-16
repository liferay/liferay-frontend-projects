module.exports = () => {
	console.log(`
require('./file');`);
	console.group();
	require('./file')();
	console.groupEnd();
};
