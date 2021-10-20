/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import spawn from 'cross-spawn';
import ejs from 'ejs';
import fs from 'fs-extra';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

/**
 * Template renderer class
 */
export class Renderer {

	/**
	 *
	 * @param {string} templatesPath
	 * @param {string} outputPath
	 */
	constructor(templatesPath, outputPath) {
		this._templatesPath = templatesPath;
		this._outputPath = outputPath;
	}

	/**
	 *
	 * @param {string} templatePath the template path
	 * @param {Object} data the contextual data to render the template
	 * @param {string} dir optional relative directory in output path
	 * @param {string} name optional output file name
	 */
	render(templatePath, data = {}, {dir = '', name} = {}) {
		dir = path.join(this._outputPath, dir);
		name = name || templatePath;

		const outputPath = path.join(dir, name);

		fs.ensureDirSync(path.dirname(outputPath));

		ejs.renderFile(
			path.join(this._templatesPath, `${templatePath}.ejs`),
			data,
			{
				escape: (text) => text,
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
		project.dir.join('node_modules', '.bin', script).asNative,
		args,
		{
			stdio: 'inherit',
		}
	);

	if (proc.error) {
		throw proc.error;
	}
	else if (proc.status !== 0) {
		throw new Error(
			`Node modules binary '${script}' finished with status ${proc.status}`
		);
	}
	else if (proc.signal) {
		throw new Error(
			`Node modules binary '${script}' finished due to signal ${proc.signal}`
		);
	}
}

/**
 *
 * @param {string} script
 * @param {Array<*>} args
 */
export function runPkgJsonScript(script, args = []) {
	const pkgManager = project.pkgManager || 'npm';

	if (pkgManager !== 'yarn') {
		args = ['--'].concat(args);
	}

	const proc = child_process.spawnSync(pkgManager, ['run', script, ...args], {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	}
	else if (proc.status !== 0) {
		throw new Error(
			`Package script '${script}' finished with status ${proc.status}`
		);
	}
	else if (proc.signal) {
		throw new Error(
			`Package script '${script}' finished due to signal ${proc.signal}`
		);
	}
}
