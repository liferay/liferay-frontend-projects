/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {project} from '../../globals';
import adaptStaticURLsAtRuntime from '../../transform/js/operation/adaptStaticURLsAtRuntime';
import * as log from '../../util/log';
import {runPkgJsonScript} from '../../util/run';
import {
	WebpackBundles,
	copyStaticAssets,
	processAdapterModules,
	processCssFiles,
	processPackageJson,
	processWebpackBundles,
} from '../index';
import tweakAttachmentToDOM from './tweakAttachmentToDOM';

const {pkgJson} = project;

const assetGlobs = [`${pkgJson.name}/assets/*`];
const cssGlobs = [`${pkgJson.name}/styles.css`];
const jsGlobs = [`${pkgJson.name}/*-es5.js`];
const rootNodeId = 'app-root';
const webpackBundles: WebpackBundles = {
	bundles: [
		{id: 'runtime', module: `${pkgJson.name}/runtime-es5.js`},
		{id: 'polyfills', module: `${pkgJson.name}/polyfills-es5.js`},
		{id: 'styles', module: `${pkgJson.name}/styles-es5.js`},
		{id: 'vendor', module: `${pkgJson.name}/vendor-es5.js`},
		{id: 'main', module: `${pkgJson.name}/main-es5.js`},
	],
	entryPointId: 'main',
};

/**
 * Adapt angular-cli project
 */
export default async function adaptAngularCli(): Promise<void> {
	log.info(`Running Angular's build...`);

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
		tweakAttachmentToDOM(rootNodeId),
		adaptStaticURLsAtRuntime(...assetGlobs)
	);

	log.info('Processing package.json file...');

	await processPackageJson(`${pkgJson.name}/styles.css`);
}
