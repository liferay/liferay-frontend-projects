/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable no-console */

const {green, red, yellow} = require('chalk');

function abort(...msgs) {
	console.error('');
	console.error(red('❌', msgs.join('\n')));
	console.error('');

	process.exit(1);
}

function success(...msgs) {
	console.log(green('✔️', msgs.join('\n')));
}

function warn(...msgs) {
	console.error(yellow('⚠️', msgs.join('\n')));
}

module.exports = {
	abort,
	success,
	warn,
};
