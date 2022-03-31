#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const yargs = require('yargs');

const index = require('../lib/index');

const {argv} = yargs
	.command(
		['install <package name>', 'i'],
		'Force reinstallation of given package in current project'
	)
	.command(
		['publish [<projects>...]', 'p'],
		'Publish current project or a list of projects to the local registry'
	)
	.command(
		['registry', 'r'],
		'Set/get the current npm and yarn configured registries',
		(yargs) =>
			yargs
				.command(
					['get', 'g'],
					'Print current npm/yarn registry',
					(yargs) =>
						yargs.option('bash-prompt', {
							default: false,
							describe:
								'Get registry in a bash prompt friendly manner',
							type: 'boolean',
						})
				)
				.command(
					['set', 's'],
					'Set the npm/yarn repo to use',
					(yargs) =>
						yargs
							.command(
								['local', 'l'],
								'Use local npm/yarn registry'
							)
							.command(
								['public', 'p'],
								'Use public npm/yarn registry'
							)
							.demandCommand()
				)
				.demandCommand()
	)
	.demandCommand()
	.help();

index(argv);
