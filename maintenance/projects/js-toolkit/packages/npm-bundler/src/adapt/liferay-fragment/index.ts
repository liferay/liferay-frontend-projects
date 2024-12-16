/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	transformJsSourceFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs-extra';

import {bundlerWebpackDir, project} from '../../globals';
import * as log from '../../util/log';

const {
	JsSource: {wrapModule},
} = TRANSFORM_OPERATIONS;

export default async function adapt(): Promise<void> {
	await transformBundles();
}

/**
 * Transform webpack bundles internalizing webpack manifest and wrapping them
 * in AMD define() calls.
 */
async function transformBundles(): Promise<void> {
	for (const id of Object.keys(project.exports)) {
		const webpackBundleName = `${id}.bundle.js`;

		const sourceFile = bundlerWebpackDir.join(webpackBundleName);

		if (!fs.existsSync(sourceFile.asNative)) {
			break;
		}

		const moduleName = new FilePath(project.exports[id])
			.toDotRelative()
			.asPosix.substr(2);

		const destFile = project.outputDir.join(moduleName);

		await transformJsSourceFile(
			sourceFile,
			destFile,
			wrapModule('__FRAGMENT_MODULE_NAME__', {
				defineDependencies: {
					__MODULE__: 'module',
					__REQUIRE__: 'require',
				},
				requireIdentifier: '__REQUIRE__',
			})
		);

		log.debug(`Transformed webpack bundle ${webpackBundleName}`);
	}
}
