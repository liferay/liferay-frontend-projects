/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

const createTempFile = require('./createTempFile');
const getExternalExportsWebpackConfigs = require('./getExternalExportsWebpackConfigs');
const getInternalExportsWebpackConfigs = require('./getInternalExportsWebpackConfigs');
const getMainWebpackConfig = require('./getMainWebpackConfig');
const runWebpack = require('./runWebpack');

/**
 * Runs webpack as a replacement of the bundler
 */
module.exports = async function runWebpackAsBundler(
	projectDir,
	buildConfig,
	babelConfig
) {
	const start = Date.now();

	const langKeys = {};

	const mainWebpackConfig = getMainWebpackConfig(
		projectDir,
		buildConfig,
		babelConfig,
		langKeys
	);

	if (mainWebpackConfig) {
		createTempFile(
			`webpackAsBundler.main.config.json`,
			JSON.stringify(mainWebpackConfig, null, 2),
			{autoDelete: false}
		);

		await runWebpack(mainWebpackConfig, buildConfig.report);
	}

	let i = 0;

	const internalExportsWebpackConfigs = getInternalExportsWebpackConfigs(
		projectDir,
		buildConfig,
		babelConfig
	);

	for (const webpackConfig of internalExportsWebpackConfigs) {
		createTempFile(
			`webpackAsBundler.export[${i++}].config.json`,
			JSON.stringify(webpackConfig, null, 2),
			{autoDelete: false}
		);

		await runWebpack(webpackConfig, buildConfig.report);
	}

	const externalExportsWebpackConfigs = getExternalExportsWebpackConfigs(
		projectDir,
		buildConfig
	);

	for (const webpackConfig of externalExportsWebpackConfigs) {
		createTempFile(
			`webpackAsBundler.export[${i++}].config.json`,
			JSON.stringify(webpackConfig, null, 2),
			{autoDelete: false}
		);

		await runWebpack(webpackConfig, buildConfig.report);
	}

	// Write lang.json

	fs.writeFileSync(
		path.join(buildConfig.output, '__liferay__', 'lang.json'),
		JSON.stringify({
			keys: Object.keys(langKeys),
		}),
		'utf-8'
	);

	const lapse = Math.floor((Date.now() - start) / 1000);

	/* eslint-disable-next-line no-console */
	console.log(`ESM bundling took ${lapse}s`);
};
