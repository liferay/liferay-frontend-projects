/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import spawn from 'cross-spawn';
import ejs from 'ejs';
import fs from 'fs-extra';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import resolveModule from 'resolve';

/**
 * Template renderer class
 */
export class Renderer {
	constructor(templatesDir, outputDir) {
		this._templatesDir = templatesDir;
		this._outputDir = outputDir;
	}

	/**
	 *
	 * @param {string} template the template path
	 * @param {Object} data the contextual data to render the template
	 * @param {string} dir optional relative directory in output path
	 * @param {string} name optional output file name
	 */
	render(template, data = {}, {dir = '', name} = {}) {
		dir = path.join(this._outputDir, dir);
		name = name || template;

		const outputPath = path.join(dir, name);

		fs.ensureDirSync(path.dirname(outputPath));

		ejs.renderFile(
			path.join(this._templatesDir, `${template}.ejs`),
			data,
			{
				escape: text => text,
			},
			(err, str) => {
				fs.writeFileSync(outputPath, str);
			}
		);
	}
}

/**
 *
 * @param {string} script
 * @param {Array<*>} args
 */
export function runNodeModulesBin(script, args = []) {
	const proc = spawn.sync(
		path.join(project.dir, 'node_modules', '.bin', script),
		args,
		{
			stdio: 'inherit',
		}
	);

	if (proc.error) {
		throw proc.error;
	} else if (proc.status != 0) {
		throw new Error(
			`Node modules binary '${script}' finished with status ${
				proc.status
			}`
		);
	} else if (proc.signal) {
		throw new Error(
			`Node modules binary '${script}' finished due to signal ${
				proc.signal
			}`
		);
	}
}

/**
 *
 * @param {string} script
 * @param {Array<*>} args
 */
export function runYarnScript(script, args = []) {
	const proc = child_process.spawnSync('yarn', ['run', script].concat(args), {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	} else if (proc.status != 0) {
		throw new Error(
			`Yarn script '${script}' finished with status ${proc.status}`
		);
	} else if (proc.signal) {
		throw new Error(
			`Yarn script '${script}' finished due to signal ${proc.signal}`
		);
	}
}

/**
 * Do a require() call in the context of the project
 * @param {string} pkgName
 */
export function projectRequire(pkgName) {
	const babelPresetPath = resolveModule.sync(pkgName, {
		basedir: project.dir,
	});

	return require(babelPresetPath);
}
