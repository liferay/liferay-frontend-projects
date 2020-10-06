#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {argv} = require('yargs')
	.option('config', {
		alias: 'c',
		type: 'string',
		description:
			'Specify path to config file to use (instead of .npmbundlerrc)',
	})
	.option('create-jar', {
		alias: 'j',
		type: 'boolean',
		description:
			'Create a JAR file as output (as opposed to an exploded directory)',
	})
	.option('dump-report', {
		alias: 'r',
		type: 'boolean',
		description:
			'Dump report HTML file with detailed information about the bundling process',
	})
	.option('version', {
		alias: 'v',
		type: 'boolean',
		description: 'Show version number and exit',
	})
	.help();

// This assignment must be done before any other project module loads, otherwise
// it may get an incorrect project object.

require('liferay-npm-build-tools-common/lib/project').default.argv = argv;

require('../lib/index').default(argv);
