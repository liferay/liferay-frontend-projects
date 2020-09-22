/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {ProjectType} from 'liferay-js-toolkit-core';
import webpack from 'webpack';

import {project} from '../../globals';
import abort from '../../util/abort';
import * as log from '../../util/log';
import adaptBundlerProject from '../adapt/bundler-project';
import adaptLiferayFragment from '../adapt/liferay-fragment';
import ExplainedError from './ExplainedError';
import configure from './configure';
import run from './run';
import writeResults from './write-results';

/**
 * Bundle current project.
 */
export default async function bundle(): Promise<webpack.Stats> {
	log.debug('Using webpack at', require.resolve('webpack'));

	log.info('Configuring webpack build...');

	const options = configure();

	log.info('Running webpack...');

	const stats = await run(options);

	if (stats.hasErrors()) {
		abortWithErrors(stats);
	}

	writeResults(stats);

	log.info('Adapting webpack output to Liferay platform...');

	if (project.probe.type === ProjectType.LIFERAY_FRAGMENT) {
		await adaptLiferayFragment();
	} else {
		await adaptBundlerProject();
	}

	log.info('Webpack phase finished successfully');

	return stats;
}

function abortWithErrors(stats: webpack.Stats): void {
	const {errors} = stats.compilation;

	errors.forEach((err) =>
		log.error(`${new ExplainedError(err).toString()}\n`)
	);

	abort(`Build failed: webpack build finished with errors`);
}
