/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import ejs from 'ejs';
import fs from 'fs';
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

		fs.mkdirSync(path.dirname(outputPath), {recursive: true});

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
export function runNpmBin(script, args = []) {
	child_process.spawnSync(
		path.join(project.dir, 'node_modules', '.bin', script),
		args,
		{stdio: 'inherit'}
	);
}

/**
 *
 * @param {string} script
 * @param {Array<*>} args
 */
export function runNpmScript(script, args = []) {
	const proc = child_process.spawnSync('npm', ['run', script].concat(args), {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.status != 0) {
		throw new Error(
			`Npm script '${script}' finished with status ${proc.status}`
		);
	} else if (proc.signal) {
		throw new Error(
			`Npm script '${script}' finished due to signal ${proc.signal}`
		);
	} else if (proc.error) {
		throw proc.error;
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
