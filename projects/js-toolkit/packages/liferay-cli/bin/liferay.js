#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {argv} = require('yargs')
	.command('build', 'Build a project created with @liferay/cli')
	.command('clean', 'Remove output directories')
	.command(
		'new <name>',
		'Create a new project with the given name',
		(yargs) =>
			yargs.option('batch', {
				default: false,
				describe:
					'Batch mode (assumes all defaults without user interaction)',
				type: 'boolean',
			})
	)
	.demandCommand()
	.help();

require('../lib/index').default(argv);
