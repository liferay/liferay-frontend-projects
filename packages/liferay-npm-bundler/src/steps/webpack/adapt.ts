/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import * as mod from 'liferay-npm-build-tools-common/lib/modules';
import * as ns from 'liferay-npm-build-tools-common/lib/namespace';
import * as pkgs from 'liferay-npm-build-tools-common/lib/packages';
import project from 'liferay-npm-build-tools-common/lib/project';

import {buildBundlerDir, buildWebpackDir} from '../../dirs';
import * as log from '../../log';

export default function adapt(): void {
	writeManifestModule();
	writeExportModules();
	copyWebpackBundles();
	internalizeWebpackManifest();
	wrapBundles();
}

/**
 * Generates an AMD module to hold webpack manifest so that it is not placed in
 * `window["webpackJsonp"]`
 */
function writeManifestModule(): void {
	const {name, version} = project.pkgJson as {name; version};
	const selfModuleName = `${name}@${version}/webpack.manifest`;

	fs.writeFileSync(
		buildBundlerDir.join(`webpack.manifest.js`).asNative,
		`Liferay.Loader.define(` +
			`'${selfModuleName}',` +
			`['module'],` +
			`function(module){\n` +
			`module.exports=[];\n` +
			`});`
	);

	log.debug(`Generated AMD module to hold webpack manifest`);
}

/**
 * Generates one AMD module per export. The generated module loads webpack's
 * runtime, the vendor bundle (common split) and the exported module itself.
 */
function writeExportModules(): void {
	Object.entries(project.exports).forEach(([id, moduleName]) => {
		if (mod.isLocalModule(moduleName)) {
			writeLocalExportModule(id, moduleName);
		} else {
			writeDependencyExportModule(id, moduleName);
		}

		log.debug(`Generated AMD module ${moduleName}`);
	});
}

function writeDependencyExportModule(id: string, moduleName: string): void {
	const {modulePath, pkgName, scope} = mod.splitModuleName(moduleName);

	const canonicalModulePath = modulePath || '/index.js';
	const scopedPkgName = mod.joinModuleName(scope, pkgName, '');
	const namespacedScopedPkgName = ns.addNamespace(
		scopedPkgName,
		project.pkgJson
	);

	const pkgJson: object = fs.readJsonSync(
		project.resolve(`${scopedPkgName}/package.json`)
	);
	const pkgDir = buildBundlerDir.join(
		'node_modules',
		pkgs.getPackageTargetDir(namespacedScopedPkgName, pkgJson['version'])
	);

	writeDependencyExportPkgJson(pkgDir, pkgJson);

	let selfModuleName =
		namespacedScopedPkgName +
		'@' +
		pkgJson['version'] +
		canonicalModulePath;

	selfModuleName = selfModuleName.replace(/\.js$/, '');

	writeExportModuleFile(
		pkgDir.join(new FilePath(canonicalModulePath, {posix: true})),
		id,
		selfModuleName,
		project.pkgJson['name']
	);
}

function writeLocalExportModule(id: string, moduleName: string): void {
	const moduleFile = buildBundlerDir.join(
		new FilePath(moduleName, {posix: true})
	);

	const {name, version} = project.pkgJson as {name; version};

	const selfModuleName = `${name}@${version}/${moduleName
		.replace('./', '')
		.replace(/\.js$/, '')}`;

	const bundlesLocation = moduleFile.dirname().relative(buildBundlerDir)
		.asPosix;

	writeExportModuleFile(moduleFile, id, selfModuleName, bundlesLocation);
}

/**
 * Writes the `package.json` file of an exported dependency package.
 *
 * @remarks
 * Because we don't export everything by default any more (like in bundler 2),
 * we must generate a very simple generated `package.json` just for Liferay to
 * process it and be compatible with bundler 2 artifacts.
 *
 * @param dir
 * @param pkgName
 * @param pkgJson
 */
function writeDependencyExportPkgJson(dir: FilePath, pkgJson: object): void {
	const generatedPkgJson = {
		name: ns.addNamespace(pkgJson['name'], project.pkgJson),
		version: pkgJson['version'],
		dependencies: {
			[project.pkgJson['name']]: project.pkgJson['version'],
		},
	};

	if (pkgJson['main']) {
		generatedPkgJson['main'] = pkgJson['main'];
	}

	const file = dir.join('package.json');

	// TODO: check if file needs regeneration to avoid webpack rebuilds
	fs.ensureDirSync(file.dirname().asNative);
	fs.writeFileSync(
		file.asNative,
		JSON.stringify(generatedPkgJson, null, '\t')
	);
}

/**
 * Writes the contents of an exports module file.
 *
 * @remarks
 * An export module file requires webpack's manifest, vendor and entry bundles
 * and re-exports the entry's exported object.
 *
 * @param moduleFile path to module file
 * @param id id of export entry
 * @param selfModuleName the full AMD name of the module
 * @param bundlesLocation location of webpack bundle files
 */
function writeExportModuleFile(
	moduleFile: FilePath,
	id: string,
	selfModuleName: string,
	bundlesLocation: string
): void {
	// TODO: check if file needs regeneration to avoid webpack rebuilds
	fs.ensureDirSync(moduleFile.dirname().asNative);
	fs.writeFileSync(
		moduleFile.asNative,
		`Liferay.Loader.define(` +
			`'${selfModuleName}',` +
			`[` +
			`'module',` +
			`'${bundlesLocation}/runtime.bundle',` +
			`'${bundlesLocation}/vendor.bundle',` +
			`'${bundlesLocation}/${id}.bundle'` +
			`],` +
			`function(module,r,v,e){\n` +
			`module.exports=e;\n` +
			`});`
	);
}

/**
 * Copy bundles generated by webpack from webpack's output dir to bundler's.
 */
function copyWebpackBundles(): void {
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
		content.replace(/window\["webpackJsonp"\]/g, '__WEBPACK_MANIFEST__');

	['runtime', 'vendor', ...Object.keys(project.exports)].forEach(id => {
		transformFile(`${id}.bundle.js`, transform);

		log.debug(`Internalized webpack manifest of ${id}.bundle.js`);
	});
}

/**
 * Wrap generated export bundles inside `Liferay.Loader.define()` calls.
 */
function wrapBundles(): void {
	['runtime', 'vendor', ...Object.keys(project.exports)].forEach(id => {
		const {name, version} = project.pkgJson as {name; version};
		const selfModuleName = `${name}@${version}/${id}.bundle`;
		const webpackManifestModuleName = `./webpack.manifest`;

		const transform = (content: string): string =>
			`Liferay.Loader.define(` +
			`'${selfModuleName}',` +
			`[` +
			`'module',` +
			`'${webpackManifestModuleName}'` +
			`],` +
			`function(__MODULE__,__WEBPACK_MANIFEST__){\n` +
			content +
			`\n});`;

		transformFile(`${id}.bundle.js`, transform);

		log.debug(`Converted ${id}.bundle.js to AMD module`);
	});
}

/**
 * Helper function to transform a file inside bundle output directory.
 *
 * @param transform callback function to translate file content
 */
function transformFile(
	fileName: string,
	transform: {(content: string): string}
): void {
	const content = fs
		.readFileSync(buildBundlerDir.join(fileName).asNative)
		.toString();

	fs.writeFileSync(
		buildBundlerDir.join(fileName).asNative,
		transform(content)
	);
}
