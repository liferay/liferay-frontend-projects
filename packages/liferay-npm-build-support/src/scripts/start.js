import childProcess from 'child_process';
import ejs from 'ejs';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import readJsonSync from 'read-json-sync';
import util from 'util';

import * as cfg from '../config';

const projectDir = cfg.getProjectDir();
const templatesDir = path.join(__dirname, '..', 'resources', 'start');
const webpackDir = path.join(projectDir, '.webpack');
const pkgJson = readJsonSync(`${projectDir}/package.json`);

/**
 *
 */
export default function() {
	copyWebpackResources();
	runWebpackDevServer();
}

/**
 *
 */
function copyWebpackResources() {
	fs.mkdirpSync(webpackDir);

	render('index.html', {
		pkgName: pkgJson.name,
		pkgVersion: pkgJson.version,
		cssPath: getCssPath(pkgJson),
	});
	render('index.js', {
		mainModule: `../src/${cfg.getWebpackMainModule()}`,
	});
	render('webpack.config.js', {
		pkgName: pkgJson.name,
		port: util.inspect(cfg.getWebpackPort()),
		rules: util.inspect(
			cfg
				.getWebpackRules()
				.map(rule => ((rule.test = new RegExp(rule.test)), rule))
		),
		extensions: util.inspect(cfg.getWebpackExtensions()),
	});
}

/**
 *
 * @param {string} template the template path
 * @param {Object} data the contextual data to render the template
 */
function render(template, data = {}) {
	ejs.renderFile(
		path.join(templatesDir, `${template}.ejs`),
		data,
		{
			escape: text => text,
		},
		(err, str) => {
			fs.writeFileSync(path.join(webpackDir, template), str);
		}
	);
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
				cfg.getProjectDir(),
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
			path.join(
				cfg.getProjectDir(),
				'node_modules',
				'.bin',
				'webpack-dev-server'
			)
		);

		proc = childProcess.spawn(process.execPath, [webpackDevServerPath], {
			cwd: webpackDir,
		});
	}

	proc.stdout.on('data', function(data) {
		console.log(data.toString());
	});

	proc.stderr.on('data', function(data) {
		console.error(data.toString());
	});
}
