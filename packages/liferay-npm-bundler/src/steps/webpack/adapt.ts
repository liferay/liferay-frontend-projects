/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import project from 'liferay-npm-build-tools-common/lib/project';

import {buildBundlerDir, buildWebpackDir} from '../../dirs';
import * as log from '../../log';

export default function adapt() {
	writeManifestModule();
	writeExportsModules();
	copyWebpackBundles();
	wrapExportBundles();
	internalizeWebpackManifest();
}

function copyWebpackBundles() {
	['runtime', 'vendor', ...Object.keys(project.exports)].forEach(id => {
		const fileName = `${id}.bundle.js`;

		const content = fs
			.readFileSync(buildWebpackDir.join(fileName).asNative)
			.toString();

		fs.writeFileSync(buildBundlerDir.join(fileName).asNative, content);

		log.debug(`Copied ${id}.bundle.js to output directory`);
	});
}

/**
 * Internalize webpack manifest object (`window["webpackJsonp"]`) so that it is
 * contained in our generated AMD manifest module instead of polluting `window`
 */
function internalizeWebpackManifest(): void {
	const transform = (content: string): string =>
		`
let __WEBPACK_MANIFEST__ = require('./webpack.manifest');
${content}
`.replace(/window\["webpackJsonp"\]/g, '__WEBPACK_MANIFEST__');

	['runtime', 'vendor', ...Object.keys(project.exports)].forEach(id => {
		transformFile(`${id}.bundle.js`, transform);

		log.debug(`Internalized webpack manifest of ${id}.bundle.js`);
	});
}

function transformFile(
	fileName: string,
	transform: {(content: string): string}
) {
	const content = fs
		.readFileSync(buildBundlerDir.join(fileName).asNative)
		.toString();

	fs.writeFileSync(
		buildBundlerDir.join(fileName).asNative,
		transform(content)
	);
}

function wrapExportBundles(): void {
	const transform = (content: string): string =>
		`
const __MODULE__ = module;
${content}`;

	Object.keys(project.exports).forEach(id => {
		transformFile(`${id}.bundle.js`, transform);

		log.debug(`Converted ${id}.bundle.js to AMD module`);
	});
}

function writeExportsModules(): void {
	Object.entries(project.exports).forEach(([id, moduleName]) => {
		const moduleFile = buildBundlerDir.join(
			new FilePath(moduleName, {posix: true})
		);

		fs.ensureDirSync(moduleFile.dirname().asNative);

		const relativeBuildBundleDirPosixPath = moduleFile
			.dirname()
			.relative(buildBundlerDir).asPosix;

		fs.writeFileSync(
			moduleFile.asNative,
			`
require('${relativeBuildBundleDirPosixPath}/runtime.bundle');
require('${relativeBuildBundleDirPosixPath}/vendor.bundle');
		
module.exports = require('${relativeBuildBundleDirPosixPath}/${id}.bundle');
`
		);

		log.debug(`Generated AMD module ${moduleName}`);
	});
}

/**
 * Generates an AMD module to hold webpack manifest so that it is not placed in
 * `window["webpackJsonp"]`
 */
function writeManifestModule(): void {
	fs.writeFileSync(
		buildBundlerDir.join(`webpack.manifest.js`).asNative,
		`module.exports = [];`
	);

	log.debug(`Generated AMD module to hold webpack manifest`);
}
