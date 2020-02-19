/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import {
	print,
	debug,
	error,
	info,
	success,
} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import webpack from 'webpack';

import {abort} from './util';

const buildGeneratedDir = new FilePath(path.join('build', 'generated'));
const buildWebpackDir = new FilePath(path.join('build', 'webpack'));

/**
 * Run configured rules.
 */
export default async function runWebpack(): Promise<webpack.Stats> {
	print(info`Configuring webpack build...`);

	const options = getOptions();

	print(info`Running webpack...`);

	const stats = await launchWebpack(options);

	if (stats.hasErrors()) {
		abortWithErrors(stats);
	}

	writeWebpackResults(stats);

	print(success`Webpack finished successfully`);

	return stats;
}

function writeWebpackResults(stats: webpack.Stats) {
	fs.ensureDirSync(buildWebpackDir.asNative);

	const {compilation} = stats;

	writeAssets(compilation.assets);
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

function getOptions(): webpack.Configuration {
	fs.emptyDirSync(buildGeneratedDir.asNative);

	// Generate entry points
	const entry = {};

	Object.entries(project.exports).forEach(([id, moduleName]) => {
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

		print(debug`Generated entry point for ${moduleName}`);
	});

	return {
		devtool: 'source-map',
		mode: 'development',
		entry,
		output: {
			filename: '[name].bundle.js',
			path: path.resolve(__dirname, buildWebpackDir.asNative),
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
	};
}

function launchWebpack(options: webpack.Configuration): Promise<webpack.Stats> {
	return new Promise((resolve, reject) => {
		const compiler = webpack(options);

		compiler.run((err, stats) => {
			if (err) {
				reject(err);
			} else {
				resolve(stats);
			}
		});
	});
}

function writeAssets(assets: object): void {
	Object.entries(assets).forEach(([fileName, source]) => {
		const filePath = buildWebpackDir.join(fileName).asNative;

		fs.writeFileSync(filePath, source.source());

		print(debug`Emitted file ${filePath}`);
	});
}
