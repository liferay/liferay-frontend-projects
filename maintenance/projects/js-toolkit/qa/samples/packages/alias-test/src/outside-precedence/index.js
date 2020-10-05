module.exports = () => {
	console.log(`
require('./outside/index.js');`);
	console.group();
	require('./outside/index.js')();
	console.groupEnd();
};
