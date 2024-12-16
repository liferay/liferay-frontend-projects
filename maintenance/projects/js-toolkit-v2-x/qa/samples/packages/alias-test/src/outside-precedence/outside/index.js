module.exports = () => {
	console.log(`
require('../file-vs-module/file');`);
	console.group();
	require('../file-vs-module/file')();
	console.groupEnd();

	console.log(`
require('../file-vs-module/file.js');`);
	console.group();
	require('../file-vs-module/file.js')();
	console.groupEnd();

	console.log(`
require('../inner-vs-outer/inner/file.js');`);
	console.group();
	require('../inner-vs-outer/inner/file.js')();
	console.groupEnd();

	console.log(`
require('../inner-vs-outer');`);
	console.group();
	require('../inner-vs-outer')();
	console.groupEnd();
};
