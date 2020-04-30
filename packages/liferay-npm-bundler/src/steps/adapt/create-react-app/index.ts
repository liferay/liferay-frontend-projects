/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import escapeStringRegexp from 'escape-string-regexp';
import ESTree from 'estree';
import project from 'liferay-npm-build-tools-common/lib/project';

import {buildBundlerDir} from '../../../dirs';
import * as log from '../../../log';
import {copyFiles, findFiles, transformTextFile} from '../../../util/files';
import {runPkgJsonScript} from '../../../util/run';
import {SourceCode, parseAs, transform} from '../../../util/transform';
import {removeWebpackHash} from '../../../util/webpack';
import {processWebpackBundles, renderTemplates} from '../index';

/**
 * Run configured rules.
 */
export default async function adaptCreateReactApp(): Promise<void> {
	log.info(`Running React's build...`);

	runPkgJsonScript('build');

	log.info('Rendering adapter modules...');

	await renderTemplates();

	log.info('Copying static assets...');

	copyStaticAssets();

	log.info(`Rewriting static asset URLs in CSS files...`);

	rewriteStaticAssetURLsInCSSFiles();

	log.info('Processing webpack bundles...');

	await processWebpackBundles(tweakAttachmentToDOM);
}

function copyStaticAssets(): void {
	const copiedFiles = copyFiles(
		project.dir.join(project.adapt.buildDir),
		['static/css/*', 'static/media/*'],
		buildBundlerDir,
		file => removeWebpackHash(file)
	);

	log.debug(`Copied ${copiedFiles.length} static assets`);
}

/**
 * Changes `document.getElementById('root')` to
 * `document.getElementById(_LIFERAY_PARAMS_.portletElementId)` so that React
 * attaches to the portlet's DIV node.
 *
 * @param source
 */
async function tweakAttachmentToDOM(source: SourceCode): Promise<SourceCode> {
	return await transform(source, source.fileName, {
		enter(node) {
			if (node.type !== 'CallExpression') {
				return;
			}

			const {arguments: args, callee} = node;

			if (callee.type !== 'MemberExpression') {
				return;
			}

			const {object, property} = callee;

			if (object.type !== 'Identifier' || object.name !== 'document') {
				return;
			}

			if (
				property.type !== 'Identifier' ||
				property.name !== 'getElementById'
			) {
				return;
			}

			if (args.length !== 1) {
				return;
			}

			if (args[0].type !== 'Literal' || args[0].value !== 'root') {
				return;
			}

			const {expression} = parseAs<ESTree.ExpressionStatement>(
				'_LIFERAY_PARAMS_.portletElementId'
			);

			args[0] = expression;
		},
	});
}

/**
 * Rewrite URLs to static assets inside CSS files so that they can be served
 * from Liferay.
 *
 * @remarks
 * This is a best effort approach that may not work when proxies or CDNs are
 * configured because we are hardcoding the '/o' part of the URL and not using
 * the adapt runtime to rewrite the URLs.
 *
 * Of course that is because we cannot execute anything inside CSS files, so we
 * can only rewrite them at build time.
 *
 * @param staticAssetFiles all static asset files in the build.liferay directory
 */
function rewriteStaticAssetURLsInCSSFiles(): void {
	const cssFiles = findFiles(buildBundlerDir, ['static/css/*.css']);

	const assetURLsMap = findFiles(project.dir.join(project.adapt.buildDir), [
		'static/media/**/*',
	]).reduce((map, sourceAsset) => {
		map[sourceAsset.asPosix] = removeWebpackHash(sourceAsset).asPosix;

		return map;
	}, {});

	cssFiles.forEach(file =>
		transformTextFile(buildBundlerDir.join(file), content =>
			rewriteStaticURLs(
				content,
				assetURLsMap,
				`o${project.jar.webContextPath}/`
			)
		)
	);

	log.debug(`Rewrote static asset URLs in ${cssFiles.length} files`);
}

/**
 * Rewrite static asset URLs inside a file (usually a webpack generated bundle).
 *
 * @param content the content to be rewritten
 * @param assetURLsMap map of source to destination assets URLs to be processed
 * @param prefix prefix to add to file path (usually contains the web context)
 */
function rewriteStaticURLs(
	content: string,
	assetURLsMap: {[source: string]: string},
	prefix = ''
): string {
	Object.entries(assetURLsMap).forEach(([srcAssetURL, destAssetURL]) => {
		const regexp = new RegExp(escapeStringRegexp(srcAssetURL), 'g');

		const matches = regexp.exec(content);

		if (!matches) {
			return;
		}

		content = content.replace(regexp, `${prefix}${destAssetURL}`);
	});

	return content;
}
