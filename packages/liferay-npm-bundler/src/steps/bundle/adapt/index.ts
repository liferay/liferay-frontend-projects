/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	addDependencies,
	addNamespace,
	deleteDependencies,
	transformJsSourceFile,
	transformJsonFile,
	wrapModule,
} from 'liferay-js-toolkit-core';
import path from 'path';

import {bundlerWebpackDir, project} from '../../../globals';
import * as log from '../../../log';
import Renderer from '../../../util/renderer';
import replaceWebpackJsonp from './replaceWebpackJsonp';
import writeExportModules from './write-export-modules';

export default async function adapt(): Promise<void> {
	await writeExportModules();
	await writeManifestModule();
	await transformBundles();
	await injectImportsInPkgJson();
}

/**
 * Inject imported packages in `package.json` so that the AMD loader may find
 * them.
 */
async function injectImportsInPkgJson(): Promise<void> {
	const {imports} = project;

	const file = project.outputDir.join('package.json');

	transformJsonFile(
		file,
		file,
		addDependencies(
			Object.entries(imports).reduce(
				(dependencies, [packageName, config]) => {
					const {provider, version} = config;

					const namespacedPkgName = addNamespace(packageName, {
						name: provider,
					});

					dependencies[namespacedPkgName] = version;

					return dependencies;
				},
				{}
			)
		),
		deleteDependencies(
			...Object.entries(imports).map(([packageName]) => packageName)
		)
	);

	log.debug(`Replaced imported packages in package.json`);
}

/**
 * Transform webpack bundles internalizing webpack manifest and wrapping them
 * in AMD define() calls.
 */
async function transformBundles(): Promise<void> {
	['runtime', 'vendor', ...Object.keys(project.exports)].forEach((id) => {
		const fileName = `${id}.bundle.js`;

		const sourceFile = bundlerWebpackDir.join(fileName);
		const destFile = project.outputDir.join(fileName);

		const {name, version} = project.pkgJson;

		transformJsSourceFile(
			sourceFile,
			destFile,
			replaceWebpackJsonp(),
			wrapModule(`${name}@${version}/${id}.bundle`, {
				defineDependencies: {
					__MODULE__: 'module',
					__REQUIRE__: 'require',
					__WEBPACK_MANIFEST__: './webpack.manifest',
				},
				requireIdentifier: '__REQUIRE__',
			})
		);

		log.debug(`Transformed webpack bundle ${fileName}`);
	});
}

/**
 * Generates an AMD module to hold webpack manifest so that it is not placed in
 * `window["webpackJsonp"]`
 */
async function writeManifestModule(): Promise<void> {
	const {name, version} = project.pkgJson;
	const moduleName = `${name}@${version}/webpack.manifest`;

	const renderer = new Renderer(path.join(__dirname, 'template'));

	fs.writeFileSync(
		project.outputDir.join(`webpack.manifest.js`).asNative,
		await renderer.render('manifest-module', {moduleName})
	);

	log.debug(`Generated AMD module to hold webpack manifest`);
}
