/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const comboServer = require('combohandler/lib/server');

comboServer({
	roots: {
		'/combo': 'build/demo',
	},
}).listen(3000);
