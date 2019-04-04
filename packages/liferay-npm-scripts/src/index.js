/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Do this as the first thing so that any code reading it knows the right env.
if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = 'production';
}

const fs = require('fs');
const minimist = require('minimist');
const inquirer = require('inquirer');
const path = require('path');
const rimraf = require('rimraf');

const CWD = process.cwd();

const TEMP_PATH = path.join(CWD, 'TEMP_LIFERAY_NPM_SCRIPTS');

module.exports = function() {
	const ARGS_ARRAY = process.argv.slice(2);

	const {
		_: [type]
	} = minimist(ARGS_ARRAY);

	if (!fs.existsSync(TEMP_PATH)) {
		fs.mkdirSync(TEMP_PATH);
	}

	switch (type) {
		case 'build':
			require('./scripts/build')();
			break;
		case 'eject':
			inquirer
				.prompt({
					default: false,
					message:
						'Are you sure you want to eject? This action is permanent.',
					name: 'eject',
					type: 'confirm'
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
		case 'theme':
			require('./scripts/theme').run(...ARGS_ARRAY.slice(1));
			break;
		case 'test':
			require('./scripts/test')(ARGS_ARRAY);
			break;
		default:
			// eslint-disable-next-line no-console
			console.log(
				`'${type}' is not a valid command for liferay-npm-scripts.`
			);
	}

	rimraf.sync(TEMP_PATH);
};
