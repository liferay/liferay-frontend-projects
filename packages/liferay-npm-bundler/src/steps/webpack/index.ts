/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	print,
	error,
	info,
	success,
} from 'liferay-npm-build-tools-common/lib/format';
import webpack from 'webpack';

import configure from './configure';
import run from './run';
import {abort} from '../util';
import writeResults from './write-results';

/**
 * Run configured rules.
 */
export default async function runWebpack(): Promise<webpack.Stats> {
	print(info`Configuring webpack build...`);

	const options = configure();

	print(info`Running webpack...`);

	const stats = await run(options);

	if (stats.hasErrors()) {
		abortWithErrors(stats);
	}

	writeResults(stats);

	print(success`Webpack finished successfully`);

	return stats;
}

function abortWithErrors(stats: webpack.Stats): void {
	const {errors} = stats.compilation;

	print(
		error`
webpack finished with errors:

${errors.map(err => `  · ${err.message}`).join('\n')}

`
	);

	abort();
}
