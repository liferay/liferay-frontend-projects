/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import FilePath from 'liferay-js-toolkit-core/lib/file-path';
import {isLocalModule} from 'liferay-js-toolkit-core/lib/modules';
import project from 'liferay-js-toolkit-core/lib/project';
import webpack from 'webpack';

import {buildGeneratedDir, buildWebpackDir} from '../../dirs';
import * as log from '../../log';
import {abort} from '../../util';

export default function configure(): webpack.Configuration {
	// Get user's config
	const webpackConfig = project.webpackConfiguration;

	// Provide defaults
	webpackConfig.devtool = webpackConfig.devtool || 'source-map';
	webpackConfig.mode = webpackConfig.mode || 'development';

	// TODO: check if any overriden field should be smart-merged instead

	// Override entry configuration
	overrideWarn('entry', webpackConfig.entry);
	webpackConfig.entry = Object.entries(project.exports).reduce(
		(entry, [id, moduleName]) => {
			let generatedFile: FilePath;

			if (isLocalModule(moduleName)) {
				generatedFile = exportLocalModule(id, moduleName);
			} else {
				generatedFile = exportDependencyModule(id, moduleName);
			}

			entry[id] = `./${generatedFile.asPosix}`;

			log.debug(`Generated entry point with id ${id} for ${moduleName}`);

			return entry;
		},
		{}
	);

	if (Object.keys(webpackConfig.entry).length === 0) {
		abort(
			'Please configure at least one export in the project ' +
				`(or add a 'main' entry to your package.json, or create an ` +
				`'index.js' file in the project's folder)`
		);
	}

	// Override output configuration
	overrideWarn('output', webpackConfig.output);
	webpackConfig.output = {
		filename: '[name].bundle.js',
		path: project.dir.join(buildWebpackDir).asNative,
	};

	// Override optimization configuration
	overrideWarn('optimization', webpackConfig.optimization);
	webpackConfig.optimization = {
		runtimeChunk: {
			name: 'runtime',
		},
		splitChunks: {
			chunks: 'initial',
			name: 'vendor',
		},
	};

	// Insert our imports loader in first position
	webpackConfig.module = webpackConfig.module || {rules: []};
	webpackConfig.module.rules.unshift({
		enforce: 'post',
		test: /.*/,
		use: [require.resolve('./plugin/imports-loader')],
	});

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

function overrideWarn(fieldName: string, value: unknown): void {
	if (value !== undefined) {
		log.warn(
			'Your liferay-npm-bundler.config.js file is configuring webpack option\n' +
				`'${fieldName}', but it will be ignored`
		);
	}
}
