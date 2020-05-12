/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	JsSourceTransform,
	PkgJson,
	setPortletHeader,
	transformJsSourceFile,
	transformJsonFile,
	wrapModule,
} from 'liferay-js-toolkit-core';
import path from 'path';

import {buildBundlerDir, buildGeneratedDir, project} from '../../globals';
import * as log from '../../log';
import {findFiles} from '../../util/files';
import Renderer from '../../util/renderer';
import exportModuleAsFunction from './transform/js/operation/exportModuleAsFunction';
import namespaceWepbackJsonp from './transform/js/operation/namespaceWepbackJsonp';

/**
 * Generate adapter modules based on templates.
 *
 * @param data extra values to pass to render engine in addition to `project`
 */
export async function processAdapterModules(data: object): Promise<void> {
	const renderer = new Renderer(
		path.join(__dirname, project.probe.type, 'templates')
	);

	await processAdapterModule(renderer, 'adapt-rt.js', {
		project,
		...data,
	});
	await processAdapterModule(renderer, 'index.js', {
		project,
		...data,
	});
}

/**
 * Process all webpack bundles to make them deployable.
 *
 * @param frameworkSpecificTransforms
 * underlying framework specific transforms to apply
 */
export async function processWebpackBundles(
	...frameworkSpecificTransforms: JsSourceTransform[]
): Promise<void> {
	const adaptBuildDir = project.dir.join(project.adapt.buildDir);

	const copiedBundles = findFiles(adaptBuildDir, ['static/js/*.js']);

	const {name, version} = project.pkgJson;

	await Promise.all(
		copiedBundles.map(async (file) => {
			const moduleName = file.asPosix.replace(/\.js$/g, '');

			await transformJsSourceFile(
				adaptBuildDir.join(file),
				buildBundlerDir.join(file),
				...frameworkSpecificTransforms,
				namespaceWepbackJsonp(),
				exportModuleAsFunction(),
				wrapModule(`${name}@${version}/${moduleName}`)
			);
		})
	);

	log.debug(`Wrapped ${copiedBundles.length} webpack bundles`);
}

async function processAdapterModule(
	renderer: Renderer,
	templatePath: string,
	data: object
): Promise<void> {
	const fromFile = buildGeneratedDir.join(templatePath);
	const toFile = buildBundlerDir.join(templatePath);

	fs.writeFileSync(
		fromFile.asNative,
		await renderer.render(templatePath, data)
	);

	const {name, version} = project.pkgJson;

	const moduleName = templatePath.replace(/\.js$/i, '');

	await transformJsSourceFile(
		fromFile,
		toFile,
		wrapModule(`${name}@${version}/${moduleName}`)
	);

	log.debug(`Rendered ${templatePath} adapter module`);
}

export async function processPackageJson(
	cssPortletHeader: string | undefined
): Promise<void> {
	const fromFile = project.dir.join('package.json');
	const toFile = buildBundlerDir.join('package.json');

	await transformJsonFile<PkgJson>(
		fromFile,
		toFile,
		setPortletHeader(
			'com.liferay.portlet.header-portlet-css',
			cssPortletHeader
		)
	);
}
