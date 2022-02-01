/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {CustomElementBuildOptions, Project} from '@liferay/js-toolkit-core';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';

import findScssFiles from '../util/findScssFiles';

export default function getWebpackConfiguration(
	project: Project
): webpack.Configuration {
	const mainEntryName = project.srcDir
		.relative(project.mainModuleFile)
		.asNative.replace(/\.js$/i, '');

	const {externals} = project.build.options as CustomElementBuildOptions;

	return {
		entry: {
			[mainEntryName]: {
				import: project.mainModuleFile.asNative,
			},

			...getScssEntryPoints(project),
		},
		experiments: {
			outputModule: true,
		},
		externals,
		externalsType: 'module',
		module: {
			rules: [
				{
					exclude: /node_modules/,
					test: /\.js$/,
					use: {
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								require.resolve('@babel/preset-env'),
								require.resolve('@babel/preset-react'),
							],
						},
					},
				},
				{
					include: new RegExp(`^${project.assetsDir.asNative}`),
					test: /\.(sass|scss)$/,
					use: [
						MiniCssExtractPlugin.loader,
						require.resolve('css-loader'),
						require.resolve('sass-loader'),
					],
				},
			],
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					extractComments: false,
				}),
			],
		},
		output: {
			environment: {
				dynamicImport: true,
				module: true,
			},
			filename: '[name].js',
			library: {
				type: 'module',
			},
			path: project.build.dir.asNative,
		},
		plugins: [new RemoveEmptyScriptsPlugin(), new MiniCssExtractPlugin()],
	};
}

function getScssEntryPoints(project: Project): {} {
	const entryPoints = {};

	findScssFiles(project).forEach((scssFile) => {
		const entryName = project.assetsDir
			.relative(scssFile)
			.asNative.replace(/\.scss$/i, '');

		entryPoints[entryName] = {
			import: scssFile.asNative,
		};
	});

	return entryPoints;
}
