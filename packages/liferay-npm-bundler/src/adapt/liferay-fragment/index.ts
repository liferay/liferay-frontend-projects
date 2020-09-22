/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	FilePath,
	transformJsSourceFile,
	wrapModule,
} from 'liferay-js-toolkit-core';

import {bundlerWebpackDir, project} from '../../globals';
import {findFiles} from '../../util/files';
import * as log from '../../util/log';

export default async function adapt(): Promise<void> {
	await transformBundles();
	await copyAssets();
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

		const {name, version} = project.pkgJson;

		await transformJsSourceFile(
			sourceFile,
			destFile,
			wrapModule(`${name}@${version}/${moduleName}`, {
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

async function copyAssets(): Promise<void> {
	const files = findFiles(project.sourceDir, ['**/*', '!**/*.js']);

	files.forEach((file) => {
		const destFile = project.outputDir.join(file);

		fs.ensureDirSync(destFile.dirname().asNative);

		fs.copyFileSync(
			project.sourceDir.join(file).asNative,
			destFile.asNative
		);
	});

	log.info(`Copied ${files.length} static files to output directory`);
}
