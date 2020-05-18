/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {project} from '../../../globals';
import * as log from '../../../log';
import {findFiles} from '../../../util/files';
import {runPkgJsonScript} from '../../../util/run';
import {
	copyStaticAssets,
	processAdapterModules,
	processCssFiles,
	processPackageJson,
	processWebpackBundles,
} from '../index';
import adaptStaticURLsAtRuntime from '../transform/js/operation/adaptStaticURLsAtRuntime';
import tweakAttachmentToDOM from './tweakAttachmentToDOM';

const assetGlobs = ['static/media/*'];
const cssGlobs = ['static/css/*.css'];
const jsGlobs = ['static/js/*.js'];

/**
 * Adapt create-react-app project
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

	await copyStaticAssets(assetGlobs);

	log.info(`Processing CSS files...`);

	await processCssFiles(cssGlobs, assetGlobs);

	log.info('Processing webpack bundles...');

	await processWebpackBundles(
		jsGlobs,
		tweakAttachmentToDOM(),
		adaptStaticURLsAtRuntime(...assetGlobs)
	);

	log.info('Processing package.json file...');

	await processPackageJson(getMainCssPosixPath());
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
