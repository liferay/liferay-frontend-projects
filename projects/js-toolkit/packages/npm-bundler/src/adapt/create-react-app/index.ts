/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

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

const assetGlobs = ['static/media/*'];
const cssGlobs = ['static/css/*.css'];
const jsGlobs = ['static/js/*.js'];
const webpackBundles: WebpackBundles = {
	bundles: [
		{id: 'runtime', module: `static/js/[runtime-main].js`},
		{id: 'two', module: `static/js/[2].js`},
		{id: 'main', module: `static/js/[main].js`},
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

	await processPackageJson('static/css/[main].css');
}
