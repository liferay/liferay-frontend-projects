/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**XX
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {PkgDesc} from 'liferay-js-toolkit-core';

import {project} from './globals';
import * as log from './log';

/**
 * Abort build and exit with return code 1
 *
 * @param message optional message to show before aborting
 */
export function abort(message?: string): void {
	if (message) {
		log.error(message);
	}

	process.exit(1);
}

/**
 * Get the project relative path to the destination directory of a package.
 *
 * @return native path to destination directory of package
 */
export function getDestDir(pkg: PkgDesc): string {
	if (pkg.isRoot) {
		return project.outputDir.asNative;
	} else {
		return project.outputDir.join('node_modules', getPackageTargetDir(pkg))
			.asNative;
	}
}

export function getPackageTargetDir(pkgJson: {
	name: string;
	version: string;
}): string {
	const {name, version} = pkgJson;

	let targetFolder = name.replace('/', '%2F');

	if (version) {
		targetFolder += `@${version}`;
	}

	return targetFolder;
}

/**
 * Iterate through the elements of an array applying an async process serially
 * to each one of them.
 *
 * @param values array of values to be iterated
 * @param asyncProcess
 * the async process (that returns a Promise) to be executed on each value
 * @return a Promise that is resolved as soon as the iteration finishes
 */
export function iterateSerially<T>(
	values: T[],
	asyncProcess: {(value: T): Promise<void>}
): Promise<void> {
	if (values.length === 0) {
		return Promise.resolve();
	}

	return asyncProcess(values[0]).then(() =>
		iterateSerially(values.slice(1), asyncProcess)
	);
}

/**
 * Run an async process over a series of items, applying the process chunk by
 * chunk.
 *
 * This is especially useful to maintain an upper bound on the maximum number of
 * open files so as to avoid EMFILE errors.
 */
export function runInChunks<T>(
	items: T[],
	chunkSize: number,
	chunkIndex: number,
	callback: {(item: T): Promise<void>}
): Promise<void> {
	const chunksCount = Math.floor((items.length + chunkSize - 1) / chunkSize);

	const chunk = items.slice(
		chunkIndex * chunkSize,
		Math.min(items.length, (chunkIndex + 1) * chunkSize)
	);

	return Promise.all(chunk.map((item) => callback(item))).then(() => {
		chunkIndex++;

		if (chunkIndex < chunksCount) {
			return runInChunks(items, chunkSize, chunkIndex, callback);
		}
	});
}
