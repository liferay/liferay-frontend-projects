/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const minimist = require('minimist');

module.exports = async function () {
	const ARGS_ARRAY = process.argv.slice(2);

	const {
		_: [type],
	} = minimist(ARGS_ARRAY);

	const PUBLIC_COMMANDS = {
		async build() {
			require('./scripts/build')();
		},

		async check() {
			await require('./scripts/check')();
		},

		async fix() {
			await require('./scripts/fix')();
		},

		prettier() {
			require('./scripts/prettier')(...ARGS_ARRAY.slice(1));
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
		},
	};

	const PRIVATE_COMMANDS = {
		format() {
			require('./scripts/format')();
		},

		'format:check': function formatCheck() {
			require('./scripts/format')({check: true});
		},

		async lint() {
			await require('./scripts/lint')();
		},

		'lint:fix': async function lintFix() {
			await require('./scripts/lint')({fix: true});
		},

		/**
		 * Only errors are reported. Warnings are ignored.
		 */
		'lint:quiet': async function lintQuiet() {
			await require('./scripts/lint')({quiet: true});
		},
	};

	const COMMANDS = {
		...PUBLIC_COMMANDS,
		...PRIVATE_COMMANDS,
	};

	if (COMMANDS[type]) {
		await COMMANDS[type]();
	}
	else {
		const commands = Object.keys(PUBLIC_COMMANDS).join(', ');

		throw new Error(
			`liferay-npm-scripts requires a valid command (${commands})`
		);
	}
};
