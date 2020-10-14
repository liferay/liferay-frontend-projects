/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	runNodeModulesBin as coreRunNodeModulesBin,
	runPkgJsonScript as coreRunPkgJsonScript,
} from '@liferay/js-toolkit-core';

import {project} from '../globals';

export function runNodeModulesBin(script: string, args: string[] = []): void {
	const result = coreRunNodeModulesBin(script, ...args);

	if (result.status !== 0) {
		throw new Error(
			`Node modules binary '${script}' finished with status ${result.status}`
		);
	}
	else if (result.signal) {
		throw new Error(
			`Node modules binary '${script}' finished due to signal ${result.signal}`
		);
	}
}

export function runPkgJsonScript(script: string, args: string[] = []): void {
	const proc = coreRunPkgJsonScript(project, script, ...args);

	if (proc.status !== 0) {
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
