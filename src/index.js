const fs = require('fs');
const minimist = require('minimist');
const inquirer = require('inquirer');
const path = require('path');
const rimraf = require('rimraf');

const CWD = process.cwd();

const TEMP_PATH = path.join(CWD, 'TEMP_LIFERAY_NPM_SCRIPTS');
const CONFIG_PATH = path.join(CWD, '.liferaynpmscriptsrc');

module.exports = function() {
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
			require('./scripts/build')(flags, config.build);
			break;
		case 'eject':
			inquirer
				.prompt({
					type: 'confirm',
					name: 'eject',
					message:
						'Are you sure you want to eject? This action is permanent.',
					default: false
				})
				.then(({eject}) => {
					if (eject) {
						require('./scripts/eject')();
					}
				});
			break;
		case 'lint':
			require('./scripts/lint')();
			break;
		case 'format':
			require('./scripts/format')();
			break;
		default:
			console.log(
				`'${type}' is not a valid command for liferay-npm-scripts.`
			);
	}

	rimraf.sync(TEMP_PATH);
};
