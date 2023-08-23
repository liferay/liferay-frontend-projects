/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

process.env.CHROME_BIN = require('puppeteer').executablePath()

const metalKarmaConfig = require('metal-karma-config');

module.exports = function (config) {
	config.set({
		browserDisconnectTimeout: 3000,
		browserNoActivityTimeout: 35000,
		client: {
			mocha: {
				timeout: 35000,
			},
		},
	});
	metalKarmaConfig(config);

	config.set({
		browsers: ['ChromeHeadless']
	})
};
