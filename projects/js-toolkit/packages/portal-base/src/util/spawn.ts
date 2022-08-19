/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import childProcess from 'child_process';

import abort from './abort';

export default function spawn(bin: string, args: string[]): void {
	const {error, signal, status} = childProcess.spawnSync(bin, args, {
		shell: true,
		stdio: 'inherit',
	});

	if (error) {
		abort(error);
	}

	if (signal) {
		abort(`{${bin}} received signal: ${signal}`);
	}

	if (status !== 0) {
		abort(`{${bin}} exited with status: ${status}`);
	}
}
