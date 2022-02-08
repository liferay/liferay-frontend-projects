/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import childProcess from 'child_process';
import spawn from 'cross-spawn';

import Project from './project/bundler3/Project';

export interface RunResult {
	signal?: NodeJS.Signals;
	status: number;
}

export function runNodeModulesBin(
	script: string,
	...args: string[]
): RunResult {
	const proc = spawn.sync(require.resolve(`.bin/${script}`), args, {
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	}

	return {
		signal: proc.signal,
		status: proc.status,
	};
}

export function runPkgJsonScript(
	project: Project,
	script: string,
	...args: string[]
): RunResult {
	const pkgManager = project.pkgManager || 'npm';

	if (pkgManager !== 'yarn') {
		args = ['--'].concat(args);
	}

	const proc = childProcess.spawnSync(pkgManager, ['run', script, ...args], {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	}

	return {
		signal: proc.signal,
		status: proc.status,
	};
}
