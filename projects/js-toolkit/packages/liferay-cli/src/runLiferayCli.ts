/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import child_process from 'child_process';
import resolve from 'resolve';

const {error: fail, print} = format;

export default async function runLiferayCli(...args: string[]): Promise<void> {
	const pkgJson = projectRequire('./package.json');

	if (!pkgJson.dependencies) {
		print(fail`Project has no dependencies: cannot find target platform`);

		return;
	}

	const targetPlatformName = Object.keys(pkgJson.dependencies).find(
		(packageName) => {
			const packageJson = projectRequire(`${packageName}/package.json`);

			if (
				packageJson.dependencies &&
				packageJson.dependencies['liferay-npm-bundler']
			) {
				return true;
			}

			return false;
		}
	);

	if (!targetPlatformName) {
		print(fail`Project has no target platform dependency`);

		return;
	}

	const packageJson = projectRequire(`${targetPlatformName}/package.json`);

	const liferayBin = packageJson.bin['liferay'];

	if (!liferayBin) {
		print(
			fail`Target platform ${targetPlatformName} has no 'liferay' binary`
		);

		return;
	}

	const bin = projectResolve(`${targetPlatformName}/${liferayBin}`);

	const {status} = child_process.spawnSync('node', [bin, ...args], {
		stdio: 'inherit',
	});

	process.exit(status);
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function projectRequire(moduleName: string): any {
	/* eslint-disable-next-line @liferay/no-dynamic-require */
	return require(projectResolve(moduleName));
}

function projectResolve(moduleName: string): string {
	return resolve.sync(moduleName, {basedir: '.'});
}
