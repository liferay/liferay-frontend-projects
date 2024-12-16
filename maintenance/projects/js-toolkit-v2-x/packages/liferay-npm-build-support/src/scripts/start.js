/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import childProcess from 'child_process';
import fs from 'fs';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import {
	error,
	print,
	success,
	warn,
} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import os from 'os';
import path from 'path';
import readJsonSync from 'read-json-sync';
import util from 'util';

import * as cfg from '../config';
import {Renderer} from '../util';

const templatesDir = path.join(__dirname, '..', 'resources', 'start');
const webpackDir = new FilePath(cfg.getStartDir(), {posix: true});
const pkgJson = project.pkgJson;

const msg = {
	alreadyEjected: [
		'',
		error`
		The {npm run start} configuration has already been ejected!
		`,
		`
		No modifications have been done to any project file.
		`,
	],

	ejectFinished: [
		success`
		The {npm run start} configuration has been successfully ejected.
		`,
	],
	ejectWarning: [
		'',
		warn`
		You have decided to {eject} the {npm run start} configuration.
		`,
		`
		This will regenerate your webpack config for the last time, and leave it 
		in the {.webpack} directory so that you can manually configure and tweak 
		it.

		The {.webpack} directory will be removed from {.gitignore} if it exists 
		in the project folder. If the project does not have a {.gitignore} file, 
		don't forget to modify the correct {.gitignore} file yourself.

		The {eject} process will also write (in your {.npmbuildrc} file) that an
		{eject} was performed, remove your {webpack} configuration, and 
		configure {.webpack} as the work directory of the {npm run start} task.

		After that, you can change the name of the {.webpack} folder (updating 
		the {.npmbuildrc} accordingly) if desired.
		`,
	],
};

/**
 *
 */
export default function () {
	if (!cfg.isStartEjected()) {
		copyWebpackResources();
	}

	if (process.argv[2] === 'eject') {
		eject();

		return;
	}

	runWebpackDevServer();
}

function eject() {
	if (cfg.isStartEjected()) {
		print(msg.alreadyEjected);

		return;
	}

	print(msg.ejectWarning);

	const npmbuildrcPath = project.dir.join('.npmbuildrc').asNative;
	let npmbuildrc = {};

	if (fs.existsSync(npmbuildrcPath)) {
		npmbuildrc = readJsonSync(npmbuildrcPath);
	}

	delete npmbuildrc.webpack;
	npmbuildrc.start = {
		dir: '.webpack',
		ejected: true,
	};

	fs.writeFileSync(
		project.dir.join('.npmbuildrc').asNative,
		JSON.stringify(npmbuildrc, null, '\t'),
		'utf8'
	);

	const gitignorePath = project.dir.join('.gitignore').asNative;

	if (fs.existsSync(gitignorePath)) {
		const gitignore = fs
			.readFileSync(gitignorePath, 'utf8')
			.split('\n')
			.filter((line) => !line.includes('.webpack/'))
			.join('\n');

		fs.writeFileSync(gitignorePath, gitignore, 'utf8');
	}

	print(msg.ejectFinished);
}

/**
 *
 */
function copyWebpackResources() {
	const renderer = new Renderer(templatesDir, webpackDir.asNative);

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
		proxy: util.inspect(cfg.getWebpackProxy()),
		rules: util.inspect(
			cfg.getWebpackRules().map((rule) => {
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
			project.dir.join('node_modules', '.bin', 'webpack-dev-server.cmd')
				.asNative
		);

		proc = childProcess.spawn(webpackDevServerPath, [], {
			cwd: webpackDir.asNative,
			shell: true,
		});
	}
	else {
		const webpackDevServerPath = path.resolve(
			project.dir.join('node_modules', '.bin', 'webpack-dev-server')
				.asNative
		);

		proc = childProcess.spawn(process.execPath, [webpackDevServerPath], {
			cwd: webpackDir.asNative,
		});
	}

	proc.stdout.on('data', (data) => {
		console.log(data.toString());
	});

	proc.stderr.on('data', (data) => {
		console.error(data.toString());
	});
}
