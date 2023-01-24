/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const ARGS_ARRAY = process.argv.slice(2);

const experimentalStandalone = ARGS_ARRAY.slice(1).includes(
	'--experimental-standalone'
);

module.exports = experimentalStandalone
	? path.join(__dirname, '..', '..')
	: undefined;
