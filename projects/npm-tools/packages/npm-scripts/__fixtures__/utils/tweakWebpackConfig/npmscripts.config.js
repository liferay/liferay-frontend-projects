/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const os = require('os');

module.exports = {
	build: {
		temp: os.tmpdir(),
	},
};
