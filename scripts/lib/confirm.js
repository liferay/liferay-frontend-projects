/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {createInterface} = require('readline');

const abort = require('./abort');

const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});

function confirm(msg) {
	return new Promise(resolve => {
		readline.question(`${msg} [y/N]? `, answer => {
			if (answer !== 'y') {
				abort('Aborted by user');
			} else {
				resolve();
			}
		});
	});
}

module.exports = confirm;
