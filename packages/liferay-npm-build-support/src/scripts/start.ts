/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

import childProcess from 'child_process';
import project, {PkgJson} from 'liferay-npm-build-tools-common/lib/project';
import os from 'os';
import path from 'path';
import util from 'util';

import * as cfg from '../config';
import {Renderer} from '../util';

const templatesDir = path.join(__dirname, '..', 'resources', 'start');
const webpackDir = project.dir.join('.webpack');
const pkgJson = project.pkgJson;

/**
 *
 */
export default function(): void {
	copyWebpackResources();
	runWebpackDevServer();
}

/**
 *
 */
function copyWebpackResources(): void {
	const renderer = new Renderer(templatesDir, webpackDir.asNative);

	renderer.render('index.html', {
		cssPath: getCssPath(pkgJson),
		pkgName: pkgJson.name,
		pkgVersion: pkgJson.version,
	});
	renderer.render('index.js', {
		mainModule: `../src/${cfg.getWebpackMainModule()}`,
	});
	renderer.render('webpack.config.js', {
		extensions: util.inspect(cfg.getWebpackExtensions()),
		pkgName: pkgJson.name,
		port: cfg.getWebpackPort(),
		proxy: util.inspect(cfg.getWebpackProxy()),
		rules: util.inspect(
			cfg.getWebpackRules().map(rule => {
				rule['test'] = new RegExp(rule['test']);

				return rule;
			})
		),
	});
}

/**
 * Get the portlet's CSS path from package.json
 * @return {string}
 */
function getCssPath(pkgJson: PkgJson): string {
	if (
		!pkgJson['portlet'] ||
		!pkgJson['portlet']['com.liferay.portlet.header-portlet-css']
	) {
		return undefined;
	}

	let path = pkgJson['portlet'][
		'com.liferay.portlet.header-portlet-css'
	] as string;

	if (path.charAt(0) !== '/') {
		path = `/${path}`;
	}

	return path;
}

/**
 *
 */
function runWebpackDevServer(): void {
	let proc;

	if (os.platform() === 'win32') {
		const webpackDevServerPath = path.resolve(
			project.dir.join('node_modules', '.bin', 'webpack-dev-server.cmd')
				.asNative
		);

		proc = childProcess.spawn(webpackDevServerPath, [], {
			cwd: webpackDir.asNative,
			shell: true,
		});
	} else {
		const webpackDevServerPath = path.resolve(
			project.dir.join('node_modules', '.bin', 'webpack-dev-server')
				.asNative
		);

		proc = childProcess.spawn(process.execPath, [webpackDevServerPath], {
			cwd: webpackDir.asNative,
		});
	}

	proc.stdout.on('data', data => {
		console.log(data.toString());
	});

	proc.stderr.on('data', data => {
		console.error(data.toString());
	});
}
