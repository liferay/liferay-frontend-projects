/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {spawn} from 'cross-spawn';
import project from 'liferay-npm-build-tools-common/lib/project';

export function runNodeModulesBin(script: string, args: string[] = []): void {
	const proc = spawn.sync(
		project.dir.join('node_modules', '.bin', script).asNative,
		args,
		{
			stdio: 'inherit',
		}
	);

	if (proc.error) {
		throw proc.error;
	} else if (proc.status != 0) {
		throw new Error(
			`Node modules binary '${script}' finished with status ${proc.status}`
		);
	} else if (proc.signal) {
		throw new Error(
			`Node modules binary '${script}' finished due to signal ${proc.signal}`
		);
	}
}

export function runPkgJsonScript(script: string, args: string[] = []): void {
	const pkgManager = project.pkgManager || 'npm';

	if (pkgManager !== 'yarn') {
		args = ['--'].concat(args);
	}

	const proc = spawn.sync(pkgManager, ['run', script, ...args], {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	} else if (proc.status != 0) {
		throw new Error(
			`Package script '${script}' finished with status ${proc.status}`
		);
	} else if (proc.signal) {
		throw new Error(
			`Package script '${script}' finished due to signal ${proc.signal}`
		);
	}
}
