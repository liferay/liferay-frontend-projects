/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Loader.define(
	'local-require/to-url',
	['module', 'require'],
	(module, require) => {
		module.exports = require.toUrl('local-require/to-url');
	}
);
