#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {argv} = require('yargs')
	.option('version', {
		alias: 'v',
		description: 'Show version number and exit',
		type: 'boolean',
	})
	.help();

require('../lib/index').default(argv);
