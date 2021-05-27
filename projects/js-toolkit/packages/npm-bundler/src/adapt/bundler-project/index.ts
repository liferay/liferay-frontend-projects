/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TemplateRenderer,
	addNamespace,
	addPkgJsonDependencies,
	deletePkgJsonDependencies,
	transformJsSourceFile,
	transformJsonFile,
	wrapModule,
} from '@liferay/js-toolkit-core';
import fs from 'fs-extra';

import {bundlerWebpackDir, project} from '../../globals';
import * as log from '../../util/log';
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

	await transformJsonFile(
		file,
		file,
		addPkgJsonDependencies(
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
		deletePkgJsonDependencies(
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
	for (const id of ['runtime', 'vendor', ...Object.keys(project.exports)]) {
		const fileName = `${id}.bundle.js`;

		const sourceFile = bundlerWebpackDir.join(fileName);

		if (!fs.existsSync(sourceFile.asNative)) {
			continue;
		}

		const destFile = project.outputDir.join(fileName);

		const {name, version} = project.pkgJson;

		await transformJsSourceFile(
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
	}
}

/**
 * Generates an AMD module to hold webpack manifest so that it is not placed in
 * `window["webpackJsonp"]`
 */
async function writeManifestModule(): Promise<void> {
	const {name, version} = project.pkgJson;
	const moduleName = `${name}@${version}/webpack.manifest`;

	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('..', 'templates')
	);

	fs.writeFileSync(
		project.outputDir.join(`webpack.manifest.js`).asNative,
		await renderer.render('manifest-module', {moduleName})
	);

	log.debug(`Generated AMD module to hold webpack manifest`);
}
