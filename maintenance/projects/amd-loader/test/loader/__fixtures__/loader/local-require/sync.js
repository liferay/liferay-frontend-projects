/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Loader.define(
	'local-require/sync',
	['module', 'require', 'local-require/a'],
	(module, require) => {
		module.exports = require('local-require/a').value;
	}
);
