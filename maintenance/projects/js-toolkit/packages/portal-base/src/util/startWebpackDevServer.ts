/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '@liferay/js-toolkit-core';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';

import getWebpackConfiguration from './getWebpackConfiguration';

export default async function startWebpackDevServer(
	project: Project
): Promise<void> {
	const config = getWebpackConfiguration(project);

	config.devtool = 'cheap-source-map';
	config.mode = 'development';

	const compiler = webpack(config);

	const devServerOptions: webpackDevServer.Configuration = {
		headers: [
			{
				key: 'access-control-allow-headers',
				value: 'Origin, X-Requested-With, Content-Type, Accept, Range',
			},
			{
				key: 'access-control-allow-origin',
				value: '*',
			},
		],
		port: project.start.port,
	};

	if (project.assetsDir) {
		devServerOptions.static = {
			directory: project.assetsDir.asNative,
		};
	}

	const server = new webpackDevServer(devServerOptions, compiler);

	await server.start();
}
