/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const https = require('https');

module.exports = function getPortalConfig(portalVersion, isEE) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'raw.githubusercontent.com',
			method: 'GET',
			path: `/liferay/liferay-portal/${portalVersion}/modules/npmscripts.config.js`,
			port: 443,
		};

		if (isEE) {
			options.path = options.path.replace(
				'/liferay-portal/',
				'/liferay-portal-ee/'
			);
			options['headers'] = {
				Authorization: `token ${process.env['CP_TOKEN']}`,
			};
		}

		const request = https.request(options, (response) => {
			if (response.statusCode !== 200) {
				return reject(
					new Error(
						`Request for ${options.path} failed: ` +
							`HTTP ${response.statusCode}`
					)
				);
			}

			let result = '';

			response.on('data', (data) => {
				result += data.toString();
			});

			response.on('end', () => {
				try {
					/* eslint-disable-next-line no-eval */
					resolve(eval(result));
				}
				catch (error) {
					reject(error);
				}
			});
		});

		request.on('error', reject);

		request.end();
	});
};
