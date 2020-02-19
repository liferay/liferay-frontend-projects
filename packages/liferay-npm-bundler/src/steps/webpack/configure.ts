/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {print, debug} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import webpack from 'webpack';

import {buildGeneratedDir, buildWebpackDir} from '../../dirs';

export default function configure(): webpack.Configuration {
	const webpackConfig: webpack.Configuration = {
		devtool: 'source-map',
		mode: 'development',
		output: {
			filename: '[name].bundle.js',
			path: project.dir.join(buildWebpackDir).asNative,
		},
		optimization: {
			splitChunks: {
				name: 'vendor',
				chunks: 'initial',
			},
			runtimeChunk: {
				name: 'runtime',
			},
		},
		entry: Object.entries(project.exports).reduce(
			(entry, [id, moduleName]) => {
				if (!moduleName.startsWith('./')) {
					// TODO: implement dependency exports
					throw new Error('Dependency exports not supported yet!');
				}

				// TODO: check if file needs regeneration to avoid webpack rebuilds

				const generatedFile = buildGeneratedDir.join(`${id}.js`);
				const relativeModuleName = moduleName.replace('./', '');

				fs.writeFileSync(
					generatedFile.asNative,
					`__MODULE__.exports = require('../../${relativeModuleName}');`
				);

				entry[id] = `./${generatedFile.asPosix}`;

				print(debug`Generated entry point for ${id}`);

				return entry;
			},
			{}
		),
	};

	// Write webpack.config.js for debugging purposes
	fs.writeFileSync(
		buildGeneratedDir.join('webpack.config.json').asNative,
		JSON.stringify(webpackConfig, null, '\t')
	);

	return webpackConfig;
}
