/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const {createProxyMiddleware} = require('http-proxy-middleware');
const path = require('path');

const STORYBOOK_CONFIG = JSON.parse(
	fs.readFileSync(path.join(__dirname, 'storybook-config.json'), 'utf8')
);

/**
 * Middleware to proxy portal resources.
 */
module.exports = function expressMiddleware(router) {
	router.use(
		'/o',
		createProxyMiddleware({
			changeOrigin: true,
			target: STORYBOOK_CONFIG.portalURL,
		})
	);
};
