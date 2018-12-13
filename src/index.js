const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const rimraf = require('rimraf');
const buildScript = require('./scripts/build');

const TEMP_PATH = path.join(__dirname, '../TEMP');

module.exports = function() {
	const CWD = process.cwd();

	const CONFIG_PATH = path.join(CWD, '.liferaynpmscriptsrc');

	let configFile = '{}';

	if (fs.existsSync(CONFIG_PATH)) {
		configFile = fs.readFileSync(CONFIG_PATH);
	}

	const config = JSON.parse(configFile);

	const {
		_: [type],
		...flags
	} = minimist(process.argv.slice(2));

	if (!fs.existsSync(TEMP_PATH)) {
		fs.mkdirSync(TEMP_PATH);
	}

	switch (type) {
		case 'build':
			buildScript(flags, config.build);
			break;
		default:
			console.log(
				`'${type}' is not a valid command for liferay-npm-scripts.`
			);
	}

	rimraf.sync(TEMP_PATH);
};
