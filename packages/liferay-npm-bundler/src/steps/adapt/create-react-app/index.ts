/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';

import {buildBundlerDir} from '../../../dirs';
import * as log from '../../../log';
import {copyFiles, findFiles} from '../../../util/files';
import {runPkgJsonScript} from '../../../util/run';
import {transformTextFile} from '../../../util/transform/text';
import {removeWebpackHash} from '../../../util/webpack';
import {
	processAdapterModules,
	processPackageJson,
	processWebpackBundles,
} from '../index';
import adaptStaticURLsAtRuntime from '../transform/js/operation/adaptStaticURLsAtRuntime';
import tweakAttachmentToDOM from './transform/js/operation/tweakAttachmentToDOM';
import rewriteStaticURLs from './transform/text/operation/rewriteStaticURLs';

/**
 * Run configured rules.
 */
export default async function adaptCreateReactApp(): Promise<void> {
	log.info(`Running React's build...`);

	runPkgJsonScript('build');

	log.info('Rendering adapter modules...');

	await processAdapterModules();

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

	await processPackageJson('/static/css/main.chunk.css');
}

function copyStaticAssets(): void {
	const copiedFiles = copyFiles(
		project.dir.join(project.adapt.buildDir),
		['static/media/*'],
		buildBundlerDir,
		file => removeWebpackHash(file)
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
			map[sourceAsset.asPosix] = removeWebpackHash(sourceAsset).asPosix;

			return map;
		},
		{}
	);

	await Promise.all(
		cssFiles.map(async file => {
			const unhashedFile = removeWebpackHash(file);

			const fromFile = adaptBuildDir.join(file);
			const toFile = buildBundlerDir.join(unhashedFile);

			await transformTextFile(
				fromFile,
				toFile,
				rewriteStaticURLs(
					assetURLsMap,
					`o${project.jar.webContextPath}/`
				)
			);
		})
	);

	log.debug(`Processed ${cssFiles.length} CSS files`);
}
