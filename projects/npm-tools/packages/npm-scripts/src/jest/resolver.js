/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = function (request, options) {
	const {defaultResolver} = options;

	// Redirect .css files to our empty.css mock file

	if (request.endsWith('.css')) {
		return require.resolve('./mocks/empty.css');
	}

	// Fallback to default resolver

	return defaultResolver(request, options);
};
