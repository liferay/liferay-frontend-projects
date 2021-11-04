/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const main = require('../src/index');

try {
	main();
}
catch (error) {
	// eslint-disable-next-line no-console
	console.log(error);

	process.exit(1);
}
