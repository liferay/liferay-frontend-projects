/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {B3ProjectType as ProjectType} from '@liferay/js-toolkit-core';
import webpack from 'webpack';

import adaptBundlerProject from '../adapt/bundler-project';
import adaptLiferayFragment from '../adapt/liferay-fragment';
import {bundlerWebpackDir, project} from '../globals';
import abort from '../util/abort';
import * as log from '../util/log';
import ExplainedError from './ExplainedError';
import configure from './configure';

/**
 * Bundle current project.
 */
export default async function bundle(): Promise<webpack.Stats> {
	log.debug('Using webpack at', require.resolve('webpack'));

	log.info('Configuring webpack build...');

	const options = configure();

	log.info('Running webpack...');

	const stats = await runWebpack(options);

	if (stats.hasErrors()) {
		abortWithErrors(stats);
	}

	writeResults(stats);

	log.info('Adapting webpack output to Liferay platform...');

	if (project.probe.type === ProjectType.LIFERAY_FRAGMENT) {
		await adaptLiferayFragment();
	}
	else {
		await adaptBundlerProject();
	}

	log.info('Webpack phase finished successfully');

	return stats;
}

function abortWithErrors(stats: webpack.Stats): void {
	const {errors} = stats.compilation;

	errors.forEach((error) =>
		log.error(`${new ExplainedError(error).toString()}\n`)
	);

	abort(`Build failed: webpack build finished with errors`);
}

function runWebpack(options: webpack.Configuration): Promise<webpack.Stats> {
	return new Promise((resolve) => {
		const compiler = webpack(options);

		compiler.hooks.done.tap('npm-bundler', (stats) => {
			resolve(stats);
		});

		compiler.run(undefined);
	});
}

function writeResults(stats: webpack.Stats): void {
	const {compilation} = stats;

	Object.keys(compilation.assets as object).forEach((fileName) => {
		log.debug(`Emitted file ${bundlerWebpackDir.join(fileName).asNative}`);
	});
}
