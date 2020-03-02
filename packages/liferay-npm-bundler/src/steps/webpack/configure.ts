/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import {isLocalModule} from 'liferay-npm-build-tools-common/lib/modules';
import project from 'liferay-npm-build-tools-common/lib/project';
import webpack from 'webpack';

import {buildGeneratedDir, buildWebpackDir} from '../../dirs';
import * as log from '../../log';

export default function configure(): webpack.Configuration {
	let webpackConfig: webpack.Configuration = {
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
				let generatedFile: FilePath;

				if (isLocalModule(moduleName)) {
					generatedFile = exportLocalModule(id, moduleName);
				} else {
					generatedFile = exportDependencyModule(id, moduleName);
				}

				entry[id] = `./${generatedFile.asPosix}`;

				log.debug(
					`Generated entry point with id ${id} for ${moduleName}`
				);

				return entry;
			},
			{}
		),
	};

	// Merge in user's config
	webpackConfig = project.webpackConfigProvider(webpackConfig);

	// Write webpack.config.js for debugging purposes
	fs.writeFileSync(
		buildGeneratedDir.join('webpack.config.json').asNative,
		JSON.stringify(webpackConfig, null, '\t')
	);

	return webpackConfig;
}

function exportDependencyModule(id: string, moduleName: string): FilePath {
	const generatedFile = buildGeneratedDir.join(`${id}.js`);

	// TODO: check if file needs regeneration to avoid webpack rebuilds

	fs.writeFileSync(
		generatedFile.asNative,
		`__MODULE__.exports = require('${moduleName}');`
	);

	return generatedFile;
}

function exportLocalModule(id: string, moduleName: string): FilePath {
	const generatedFile = buildGeneratedDir.join(`${id}.js`);
	const relativeModuleName = moduleName.replace('./', '');

	// TODO: check if file needs regeneration to avoid webpack rebuilds

	fs.writeFileSync(
		generatedFile.asNative,
		`__MODULE__.exports = require('../../${relativeModuleName}');`
	);

	return generatedFile;
}
