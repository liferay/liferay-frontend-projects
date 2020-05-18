/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {project} from '../../../globals';
import * as log from '../../../log';
import {findFiles} from '../../../util/files';
import {runPkgJsonScript} from '../../../util/run';
import {
	WebpackBundles,
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
const webpackBundles: WebpackBundles = {
	bundles: [
		{id: 'runtime', module: `static/js/[runtime-main]`},
		{id: 'two', module: `static/js/[2]`},
		{id: 'main', module: `static/js/[main]`},
	],
	entryPointId: 'main',
};

/**
 * Adapt create-react-app project
 */
export default async function adaptCreateReactApp(): Promise<void> {
	log.info(`Running React's build...`);

	runPkgJsonScript('build');

	log.info('Rendering adapter modules...');

	await processAdapterModules(webpackBundles);

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
