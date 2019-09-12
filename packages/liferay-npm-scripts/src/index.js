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

	const PUBLIC_COMMANDS = {
		build() {
			require('./scripts/build')();
		},

		check() {
			require('./scripts/check')();
		},

		fix() {
			require('./scripts/fix')();
		},

		storybook() {
			require('./scripts/storybook')();
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

	const PRIVATE_COMMANDS = {
		// Temporary command to test our `csf` replacement; will be folded into
		// "format" etc.
		csf() {
			require('./format')(ARGS_ARRAY.slice(1));
		},

		format() {
			require('./scripts/format')();
		},

		'format:check': function formatCheck() {
			require('./scripts/format')({check: true});
		},

		lint() {
			require('./scripts/lint')();
		},

		'lint:fix': function lintFix() {
			require('./scripts/lint')({fix: true});
		},

		/**
		 * Only errors are reported. Warnings are ignored.
		 */
		'lint:quiet': function lintQuiet() {
			require('./scripts/lint')({quiet: true});
		}
	};

	const COMMANDS = {
		...PUBLIC_COMMANDS,
		...PRIVATE_COMMANDS
	};

	if (COMMANDS[type]) {
		COMMANDS[type]();
	} else {
		const commands = Object.keys(PUBLIC_COMMANDS).join(', ');
		throw new Error(
			`liferay-npm-scripts requires a valid command (${commands})`
		);
	}
};
