/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Loader.define(
	'local-require/failure',
	['module', 'require', 'missing-module'],
	(module, require) => {
		module.exports = require('missing-module');
	}
);
