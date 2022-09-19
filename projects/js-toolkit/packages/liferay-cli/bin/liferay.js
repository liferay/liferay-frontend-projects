#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

if (process.argv[2] === '--which') {
	/* eslint-disable-next-line no-console */
	console.log(__filename);
	process.exit(0);
}

const {argv} = require('yargs')
	.command('adapt', 'Adapt the project in the current directory', (yargs) =>
		yargs
			.option('batch', {
				default: false,
				describe:
					'Batch mode (assumes all defaults without user interaction)',
				type: 'boolean',
			})
			.option('options', {
				describe:
					'Path to a file containing default values for options',
				type: 'string',
			})
	)
	.command('build', 'Build a project created with @liferay/cli', (yargs) =>
		yargs.option('configure', {
			default: false,
			describe: 'Show the configuration wizard to tweak build options',
			type: 'boolean',
		})
	)
	.command('clean', 'Remove output directories')
	.command(
		'deploy',
		'Build the project, then deploy it to your local Liferay installation',
		(yargs) =>
			yargs
				.option('configure', {
					default: false,
					describe:
						'Show the configuration wizard to tweak deploy options',
					type: 'boolean',
				})
				.option('only', {
					default: false,
					describe: `Deploy only: don't build project before`,
					type: 'boolean',
				})
	)
	.command('docs', 'Browse Liferay JavaScript Toolkit documentation')
	.command(
		'new <name>',
		'Create a new project with the given name',
		(yargs) =>
			yargs
				.option('batch', {
					default: false,
					describe:
						'Batch mode (assumes all defaults without user interaction)',
					type: 'boolean',
				})
				.option('options', {
					describe:
						'Path to a file containing default values for options',
					type: 'string',
				})
	)
	.command(
		'start',
		'Start a live development server for a project',
		(yargs) =>
			yargs
				.option('configure', {
					default: false,
					describe:
						'Show the configuration wizard to tweak start options',
					type: 'boolean',
				})
				.option('only', {
					default: false,
					describe: `Start only: don't deploy live project before`,
					type: 'boolean',
				})
	)
	.command(
		'upgrade-project',
		'Upgrade a project created with the old Yeoman generator'
	)
	.demandCommand()
	.help();

require('../lib/index').default(argv);
