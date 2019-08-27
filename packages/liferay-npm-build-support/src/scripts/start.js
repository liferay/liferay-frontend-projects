/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import childProcess from 'child_process';
import project from 'liferay-npm-build-tools-common/lib/project';
import os from 'os';
import path from 'path';
import readJsonSync from 'read-json-sync';
import util from 'util';

import * as cfg from '../config';
import { Renderer } from '../util';

const templatesDir = path.join(__dirname, '..', 'resources', 'start');
const webpackDir = path.join(project.dir, '.webpack');
const pkgJson = readJsonSync(path.join(project.dir, 'package.json'));

/**
 *
 */
export default function () {
	copyWebpackResources();
	runWebpackDevServer();
}

/**
 *
 */
function copyWebpackResources() {
	const renderer = new Renderer(templatesDir, webpackDir);

	renderer.render('index.html', {
		pkgName: pkgJson.name,
		pkgVersion: pkgJson.version,
		cssPath: getCssPath(pkgJson),
	});
	renderer.render('index.js', {
		mainModule: `../src/${cfg.getWebpackMainModule()}`,
	});
	renderer.render('webpack.config.js', {
		pkgName: pkgJson.name,
		port: cfg.getWebpackPort(),
		rules: util.inspect(
			cfg.getWebpackRules().map(rule => {
				rule.test = new RegExp(rule.test);
				return rule;
			})
		),
		extensions: util.inspect(cfg.getWebpackExtensions()),
	});
}

/**
 * Get the portlet's CSS path from package.json
 * @return {string}
 */
function getCssPath() {
	if (
		!pkgJson['portlet'] ||
		!pkgJson['portlet']['com.liferay.portlet.header-portlet-css']
	) {
		return undefined;
	}

	let path = pkgJson['portlet']['com.liferay.portlet.header-portlet-css'];

	if (path.charAt(0) !== '/') {
		path = `/${path}`;
	}

	return path;
}

/**
 *
 */
function runWebpackDevServer() {
	let proc;

	if (os.platform() === 'win32') {
		const webpackDevServerPath = path.resolve(
			path.join(
				project.dir,
				'node_modules',
				'.bin',
				'webpack-dev-server.cmd'
			)
		);

		proc = childProcess.spawn(webpackDevServerPath, [], {
			cwd: webpackDir,
			shell: true,
		});
	} else {
		const webpackDevServerPath = path.resolve(
			path.join(project.dir, 'node_modules', '.bin', 'webpack-dev-server')
		);

		proc = childProcess.spawn(process.execPath, [webpackDevServerPath], {
			cwd: webpackDir,
		});
	}

	proc.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	proc.stderr.on('data', function (data) {
		console.error(data.toString());
	});
}
