/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import spawn from 'cross-spawn';

import type {Project} from 'liferay-npm-build-tools-common/lib/project';

export default function runNodeModulesBin(
	project: Project,
	script: string,
	args: string[] = []
): void {
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
	else if (proc.status != 0) {
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
