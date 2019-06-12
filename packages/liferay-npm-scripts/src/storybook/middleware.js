/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const proxy = require('http-proxy-middleware');

const getMergedConfig = require('../utils/getMergedConfig');

const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

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
