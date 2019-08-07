/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const proxy = require('http-proxy-middleware');

const STORYBOOK_CONFIG = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'storybook-config.json'))
);

/**
 * Middleware to proxy portal resources.
 */
module.exports = function expressMiddleware(router) {
	router.use(
		'/o',
		proxy({
			changeOrigin: true,
			target: STORYBOOK_CONFIG.portalURL
		})
	);
};
