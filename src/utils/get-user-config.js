const fs = require('fs');
const path = require('path');

const CWD = process.cwd();

module.exports = function(filename, packageKey) {
	let config = {};

	const FILE_PATH = path.join(CWD, filename);
	const PACKAGE_FILE_PATH = path.join(CWD, 'package.json');

	if (fs.existsSync(FILE_PATH)) {
		const configFile = fs.readFileSync(FILE_PATH);

		config = JSON.parse(configFile);
	} else if (packageKey && fs.existsSync(PACKAGE_FILE_PATH)) {
		const configFile = fs.readFileSync(PACKAGE_FILE_PATH);
		const configJSON = JSON.parse(configFile);

		if (configJSON && configJSON[packageKey]) {
			config = configJSON[packageKey];
		}
	}

	return config;
};
