/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const chalk = require('chalk');

function say(line) {
	console.error(chalk.red(line));
}

say('');
say('Please use `yarn release` instead of `yarn publish` to make sure all');
say('sanity checks and needed steps to ensure release quality are taken.');
say('');

process.exit(1);
