/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const minimist = require('minimist');

module.exports = function() {
	const ARGS_ARRAY = process.argv.slice(2);

	const {
		_: [type]
	} = minimist(ARGS_ARRAY);

	const COMMANDS = {
		build() {
			require('./scripts/build')();
		},

		check() {
			require('./scripts/check')();
		},

		fix() {
			require('./scripts/fix')();
		},

		test() {
			require('./scripts/test')(ARGS_ARRAY);
		},

		theme() {
			require('./scripts/theme').run(...ARGS_ARRAY.slice(1));
		},

		webpack() {
			require('./scripts/webpack')(...ARGS_ARRAY.slice(1));
		}
	};

	if (COMMANDS[type]) {
		COMMANDS[type]();
	} else {
		const commands = Object.keys(COMMANDS).join(', ');
		throw new Error(
			`liferay-npm-scripts requires a valid command (${commands})`
		);
	}
};
