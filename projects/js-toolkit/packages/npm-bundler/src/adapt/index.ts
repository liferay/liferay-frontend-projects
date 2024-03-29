/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	JsSourceTransform,
	PkgJson,
	TRANSFORM_OPERATIONS,
	TemplateRenderer,
	escapeStringRegExp,
	transformJsSourceFile,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs-extra';
import path from 'path';

import {bundlerGeneratedDir, project} from '../globals';
import exportModuleAsFunction from '../transform/js/operation/exportModuleAsFunction';
import namespaceWepbackJsonp from '../transform/js/operation/namespaceWepbackJsonp';
import replace from '../transform/text/operation/replace';
import {copyFiles, findFiles} from '../util/files';
import * as log from '../util/log';

const {
	JsSource: {wrapModule},
	PkgJson: {addPortletProperties},
} = TRANSFORM_OPERATIONS;

/**
 * Description of framework's webpack build output so that adapted modules can
 * be generated.
 */
export interface WebpackBundles {

	/** Description of webpack bundles generated by the framework's build */
	bundles: {

		/** Variable id to hold the required module */
		id: string;

		/**
		 * Required module name
		 *
		 * @remarks
		 * The module name may contain `[module]` when the module is stored in a
		 * file with a webpack hash in its name. In that case, the `[module]`
		 * will be replaced by `module.hash`.
		 */
		module: string;
	}[];

	/** Which bundle (of the above) contains the entry point */
	entryPointId: string;
}

export async function copyStaticAssets(globs: string[]): Promise<void> {
	const copiedFiles = copyFiles(
		project.adapt.buildDir,
		globs,
		project.outputDir
	);

	log.debug(`Copied static assets: ${copiedFiles.length}`);
}

/**
 * Generate adapter modules based on templates.
 *
 * @param data extra values to pass to render engine in addition to `project`
 */
export async function processAdapterModules(
	webpackBundles: WebpackBundles,
	data: object = {}
): Promise<void> {
	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('templates')
	);
	const frameworkRenderer = new TemplateRenderer(
		new FilePath(__dirname).join(project.probe.type, 'templates')
	);

	webpackBundles = compileWebpackBundles(webpackBundles);

	const mergedData = {
		entryPointFunction: webpackBundles.entryPointId,
		preloadBlock: getPreloadBlock(webpackBundles),
		project,
		requireBlock: getRequireBlock(webpackBundles),
		...data,
	};

	await processAdapterModule(renderer, 'index.js', mergedData);
	await processAdapterModule(frameworkRenderer, 'adapt-rt.js', mergedData);
}

/**
 * Process all webpack bundles to make them deployable.
 *
 * @param frameworkSpecificTransforms
 * underlying framework specific transforms to apply
 */
export async function processWebpackBundles(
	globs: string[],
	...frameworkSpecificTransforms: JsSourceTransform[]
): Promise<void> {
	const adaptBuildDir = project.adapt.buildDir;

	const copiedBundles = findFiles(adaptBuildDir, globs);

	const {name, version} = project.pkgJson;

	await Promise.all(
		copiedBundles.map(async (file) => {
			const moduleName = file.asPosix.replace(/\.js$/g, '');

			await transformJsSourceFile(
				adaptBuildDir.join(file),
				project.outputDir.join(file),
				...frameworkSpecificTransforms,
				namespaceWepbackJsonp(),
				exportModuleAsFunction(),
				wrapModule(`${name}@${version}/${moduleName}`)
			);
		})
	);

	log.debug(`Wrapped webpack bundles: ${copiedBundles.length}`);
}

async function processAdapterModule(
	renderer: TemplateRenderer,
	templatePath: string,
	data: object
): Promise<void> {
	const fromFile = bundlerGeneratedDir.join(templatePath);
	const toFile = project.outputDir.join(templatePath);

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

/**
 * Process CSS files to rewrite URLs to static assets so that they can be served
 * from Liferay.
 *
 * @param cssGlobs globs of CSS files to process
 * @param assetGlobs globs of static assets to rewrite in CSS files
 *
 * @remarks
 * This is a best effort approach that may not work when proxies or CDNs are
 * configured because we are hardcoding the '/o' part of the URL and not using
 * the adapt runtime to rewrite the URLs.
 *
 * Of course that is because we cannot execute anything inside CSS files, so we
 * can only rewrite them at build time.
 */
export async function processCssFiles(
	cssGlobs: string[],
	assetGlobs: string[]
): Promise<void> {
	const adaptBuildDir = project.adapt.buildDir;

	const cssFiles = findFiles(adaptBuildDir, cssGlobs);

	const assetURLsMap = findFiles(adaptBuildDir, assetGlobs).reduce(
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
				project.outputDir.join(file),
				replace(assetURLsMap)
			);
		})
	);

	log.debug(`Processed CSS files: ${cssFiles.length}`);
}

/**
 *
 * @param cssPortletHeader
 * Path to CSS file to use as header portlet CSS file.
 *
 * Note that it may contain `[filename]` when the CSS is stored in a file with a
 * webpack hash in its name. In that case, the `[filename]` will be replaced by
 * `filename.hash`.
 */
export async function processPackageJson(
	cssPortletHeader: string | undefined
): Promise<void> {
	const fromFile = project.dir.join('package.json');
	const toFile = project.outputDir.join('package.json');

	await transformJsonFile<PkgJson>(
		fromFile,
		toFile,
		addPortletProperties({
			'com.liferay.portlet.header-portlet-css': findRealFileName(
				cssPortletHeader,
				false
			),
		})
	);
}

function compileWebpackBundles(webpackBundles: WebpackBundles): WebpackBundles {
	return {
		bundles: webpackBundles.bundles.map((bundle) => ({
			id: bundle.id,
			module: findRealFileName(bundle.module),
		})),
		entryPointId: webpackBundles.entryPointId,
	};
}

function findRealFileName(
	file: string,
	failIfNotFound = true
): string | undefined {
	const adaptBuildDir = project.adapt.buildDir;

	const match = file.match(/.*\[(.*)\].*/);

	if (!match || match.length < 2) {
		if (!fs.existsSync(adaptBuildDir.join(file).asNative)) {
			if (failIfNotFound) {
				throw new Error(
					`Framework's build did not produce any ${file} artifact`
				);
			}
			else {
				return undefined;
			}
		}

		return file;
	}

	const baseFilename = match[1];

	const glob = file.replace(`[${baseFilename}]`, `${baseFilename}.*`);

	const candidateFiles = findFiles(adaptBuildDir, [glob]);

	if (!candidateFiles.length) {
		if (failIfNotFound) {
			throw new Error(
				`Framework's build did not produce any ${file} artifact`
			);
		}
		else {
			return undefined;
		}
	}
	else if (candidateFiles.length > 1) {
		throw new Error(
			`Framework's build produced more than one ${file} artifact: ` +
				`cannot determine which one to use`
		);
	}

	const filename = candidateFiles[0].basename().toString();

	const extRegExp = new RegExp(`${escapeStringRegExp(path.extname(file))}$`);

	return file.replace(`[${baseFilename}]`, filename.replace(extRegExp, ''));
}

function getPreloadBlock(webpackBundles: WebpackBundles): string {
	return webpackBundles.bundles
		.filter(({id}) => id !== webpackBundles.entryPointId)
		.reduce((codeBlock, {id}) => `${codeBlock}${id}();\n`, '');
}

function getRequireBlock(webpackBundles: WebpackBundles): string {
	return webpackBundles.bundles.reduce((codeBlock, {id, module}) => {
		const moduleName = module.replace(/\.js$/, '');

		return `${codeBlock}var ${id} = require('./${moduleName}');\n`;
	}, '');
}
