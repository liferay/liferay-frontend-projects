/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {red} = require('chalk');

function abort(msg) {
	console.error(`\n${red(`❌ ${msg}`)}\n`);
	process.exit(1);
}

module.exports = abort;
