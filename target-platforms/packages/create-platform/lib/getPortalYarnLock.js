/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const getPortalVersion = require('./getPortalVersion');
const isPortalDir = require('./isPortalDir');

module.exports = function getPortalYarnLock(tagOrDir, isEE) {
	if (isPortalDir(tagOrDir)) {
		try {
			return fs
				.readFileSync(
					path.join(tagOrDir, 'modules', 'yarn.lock'),
					'utf8'
				)
				.toString()
				.trim()
				.split('\n');
		}
		catch (error) {
			if (error.code !== 'ENOENT') {
				throw error;
			}

			return [];
		}
	}
	else {
		const portalVersion = getPortalVersion(tagOrDir);

		return new Promise((resolve, reject) => {
			const options = {
				hostname: 'raw.githubusercontent.com',
				method: 'GET',
				path: `/liferay/liferay-portal/${portalVersion}/modules/yarn.lock`,
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
					resolve(result.split('\n'));
				});
			});

			request.on('error', reject);

			request.end();
		});
	}
};
