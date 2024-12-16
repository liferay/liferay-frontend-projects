#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {argv} = require('yargs')
	.option('config', {
		alias: 'c',
		description:
			'Specify path to config file to use (instead of liferay-npm-bundler.config.js)',
		type: 'string',
	})
	.option('create-jar', {
		alias: 'j',
		description:
			'Create a JAR file as output (as opposed to an exploded directory)',
		type: 'boolean',
	})
	.option('dump-report', {
		alias: 'r',
		description:
			'Dump report HTML file with detailed information about the bundling process',
		type: 'boolean',
	})
	.option('version', {
		alias: 'v',
		description: 'Show version number and exit',
		type: 'boolean',
	})
	.help();

// This assignment must be done before any other project module loads, otherwise
// it may get an incorrect project object.

require('../lib/globals').project.argv = argv;

require('../lib/index').default(argv);
