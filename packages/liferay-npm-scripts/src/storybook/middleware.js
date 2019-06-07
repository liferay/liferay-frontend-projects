/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const proxy = require('http-proxy-middleware');

/**
 * Middleware to proxy portal resources. This was first created to be able to
 * reference icons in the admin theme from Storybook.
 */
module.exports = function expressMiddleware(router) {
	router.use(
		'/o',
		proxy({
			changeOrigin: true,
			target: 'http://0.0.0.0:8080'
		})
	);
};
