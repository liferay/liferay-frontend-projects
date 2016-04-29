var os = require('os');

module.exports = function() {
	var listType = 'list';

	if (process.version > 'v0.12.7' && os.type() == 'Windows_NT') {
		listType = 'rawlist';
	}

	return listType;
};