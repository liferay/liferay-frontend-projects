/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const minimist = require('minimist');
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

		case 'format':
			require('./scripts/format')();
			break;

		case 'lint':
			require('./scripts/lint')();
			break;

		case 'test':
			require('./scripts/test')(ARGS_ARRAY);
			break;

		case 'theme':
			require('./scripts/theme').run(...ARGS_ARRAY.slice(1));
			break;

		case 'webpack':
			require('./scripts/webpack')(...ARGS_ARRAY.slice(1));
			break;

		default:
			// eslint-disable-next-line no-console
			console.log(
				`'${type}' is not a valid command for liferay-npm-scripts.`
			);
	}

	rimraf.sync(TEMP_PATH);
};
