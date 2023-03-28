/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

const isPortalDir = require('./isPortalDir');

module.exports = function getPortalFile(portalTagOrDir, filePath) {
	if (isPortalDir(portalTagOrDir)) {
		return Promise.resolve(
			fs.readFileSync(path.join(portalTagOrDir, filePath), 'utf-8')
		);
	}
	else {
		return new Promise((resolve, reject) => {
			const options = {
				hostname: 'raw.githubusercontent.com',
				method: 'GET',
				path: `/liferay/liferay-portal/${portalTagOrDir}/${filePath}`,
				port: 443,
			};

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
						resolve(result);
					}
					catch (error) {
						reject(error);
					}
				});
			});

			request.on('error', reject);

			request.end();
		});
	}
};
