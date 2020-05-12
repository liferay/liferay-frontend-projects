/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {transformTextFile} from 'liferay-js-toolkit-core';

import {buildBundlerDir, project} from '../../../globals';
import * as log from '../../../log';
import {copyFiles, findFiles} from '../../../util/files';
import {runPkgJsonScript} from '../../../util/run';
import {
	processAdapterModules,
	processPackageJson,
	processWebpackBundles,
} from '../index';
import adaptStaticURLsAtRuntime from '../transform/js/operation/adaptStaticURLsAtRuntime';
import tweakAttachmentToDOM from './transform/js/operation/tweakAttachmentToDOM';
import replace from './transform/text/operation/replace';

/**
 * Run configured rules.
 */
export default async function adaptCreateReactApp(): Promise<void> {
	log.info(`Running React's build...`);

	runPkgJsonScript('build');

	log.info('Rendering adapter modules...');

	await processAdapterModules({
		mainModuleName: getWebpackBundleModuleName('main'),
		runtimeMainModuleName: getWebpackBundleModuleName('runtime-main'),
		twoModuleName: getWebpackBundleModuleName('2'),
	});

	log.info('Copying static assets...');

	copyStaticAssets();

	log.info(`Processing CSS files...`);

	await processCssFiles();

	log.info('Processing webpack bundles...');

	await processWebpackBundles(
		tweakAttachmentToDOM(),
		adaptStaticURLsAtRuntime('static/media/*')
	);

	log.info('Processing package.json file...');

	await processPackageJson(getMainCssPosixPath());
}

function copyStaticAssets(): void {
	const copiedFiles = copyFiles(
		project.dir.join(project.adapt.buildDir),
		['static/media/*'],
		buildBundlerDir
	);

	log.debug(`Copied ${copiedFiles.length} static assets`);
}

/**
 * Process CSS files to rewrite URLs to static assets so that they can be served
 * from Liferay.
 *
 * @remarks
 * This is a best effort approach that may not work when proxies or CDNs are
 * configured because we are hardcoding the '/o' part of the URL and not using
 * the adapt runtime to rewrite the URLs.
 *
 * Of course that is because we cannot execute anything inside CSS files, so we
 * can only rewrite them at build time.
 */
async function processCssFiles(): Promise<void> {
	const adaptBuildDir = project.dir.join(project.adapt.buildDir);

	const cssFiles = findFiles(adaptBuildDir, ['static/css/*.css']);

	const assetURLsMap = findFiles(adaptBuildDir, ['static/media/*']).reduce(
		(map, sourceAsset) => {
			map.set(
				sourceAsset.asPosix,
				`o${project.jar.webContextPath}/${sourceAsset.asPosix}`
			);

			return map;
		},
		new Map<string, string>()
	);

	await Promise.all(
		cssFiles.map(async (file) => {
			await transformTextFile(
				adaptBuildDir.join(file),
				buildBundlerDir.join(file),
				replace(assetURLsMap)
			);
		})
	);

	log.debug(`Processed ${cssFiles.length} CSS files`);
}

function getMainCssPosixPath(): string | undefined {
	const adaptBuildDir = project.dir.join(project.adapt.buildDir);

	const candidateFiles = findFiles(adaptBuildDir, ['static/css/main.*.css']);

	if (candidateFiles.length === 0) {
		return undefined;
	}

	if (candidateFiles.length > 1) {
		// TODO: warn
	}

	return candidateFiles[0].asPosix;
}

function getWebpackBundleModuleName(name: string): string {
	const adaptBuildDir = project.dir.join(project.adapt.buildDir);

	const candidateFiles = findFiles(adaptBuildDir, [`static/js/${name}.*.js`]);

	if (candidateFiles.length !== 1) {
		throw new Error(`React build did not produce any ${name}.js artifact`);
	}

	return candidateFiles[0].basename().asPosix.replace(/\.js$/, '');
}
