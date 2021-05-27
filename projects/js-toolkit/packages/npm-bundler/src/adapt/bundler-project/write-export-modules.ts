/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	PkgDesc,
	PkgJson,
	TemplateRenderer,
	addNamespace,
	isLocalModule,
	joinModuleName,
	splitModuleName,
} from '@liferay/js-toolkit-core';
import fs from 'fs-extra';

import {bundlerWebpackDir, manifest, project} from '../../globals';
import * as log from '../../util/log';

/**
 * Generates one AMD module per export. The generated module loads webpack's
 * runtime, the vendor bundle (common split) and the exported module itself.
 */
export default async function writeExportModules(): Promise<void> {
	await Promise.all(
		Object.entries(project.exports).map(async ([id, moduleName]) => {
			if (isLocalModule(moduleName)) {
				await writeLocalExportModule(id, moduleName);
			}
			else {
				await writeDependencyExportModule(id, moduleName);
			}

			log.debug(`Generated AMD module ${moduleName}`);
		})
	);
}

function getPackageTargetDir(pkgJson: {name: string; version: string}): string {
	const {name, version} = pkgJson;

	let targetFolder = name.replace('/', '%2F');

	if (version) {
		targetFolder += `@${version}`;
	}

	return targetFolder;
}

async function writeDependencyExportModule(
	id: string,
	moduleName: string
): Promise<void> {
	const {modulePath, pkgName, scope} = splitModuleName(moduleName);

	const canonicalModulePath = modulePath || '/index.js';
	const scopedPkgName = joinModuleName(scope, pkgName, '');
	const namespacedScopedPkgName = addNamespace(
		scopedPkgName,
		project.pkgJson
	);

	const pkgJson: PkgJson = fs.readJsonSync(
		project.resolve(`${scopedPkgName}/package.json`)
	);
	const pkgDir = project.outputDir.join(
		'node_modules',
		getPackageTargetDir({
			name: namespacedScopedPkgName,
			version: pkgJson.version,
		})
	);

	await writeDependencyExportPkgJson(pkgDir, pkgJson);
	addPackageToManifest(pkgJson, pkgDir);

	moduleName =
		namespacedScopedPkgName + '@' + pkgJson.version + canonicalModulePath;

	moduleName = moduleName.replace(/\.js$/, '');

	await writeExportModule(
		pkgDir.join(new FilePath(canonicalModulePath, {posix: true})),
		id,
		moduleName,
		project.pkgJson.name
	);
}

function addPackageToManifest(pkgJson: PkgJson, destDir: FilePath): void {
	const {name, version} = pkgJson;

	const srcDirPath = project
		.resolve(`${name}/package.json`)
		.replace('/package.json', '');

	manifest.addPackage(
		new PkgDesc(name, version, project.dir.relative(srcDirPath).asPosix),
		new PkgDesc(
			addNamespace(name, project.pkgJson),
			version,
			project.dir.relative(destDir).asPosix
		)
	);
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
 * @param pkgJson
 */
async function writeDependencyExportPkgJson(
	dir: FilePath,
	pkgJson: PkgJson
): Promise<void> {
	const generatedPkgJson: PkgJson = {
		dependencies: {
			[project.pkgJson.name]: project.pkgJson.version,
		},
		name: addNamespace(pkgJson.name, project.pkgJson),
		version: pkgJson.version,
	};

	if (pkgJson.main) {
		generatedPkgJson.main = pkgJson.main;
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
 * @param moduleName the full AMD name of the module
 * @param bundlesLocation location of webpack bundle files (f.e.: './path/to')
 */
async function writeExportModule(
	moduleFile: FilePath,
	id: string,
	moduleName: string,
	bundlesLocation: string
): Promise<void> {
	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('..', 'templates')
	);

	const dependencies = [
		`${bundlesLocation}/${id}.bundle`,
		`${bundlesLocation}/runtime.bundle`,
	];

	const dependencyVariables = ['entry', 'runtime'];

	const vendorBundleJsFile = bundlerWebpackDir.join('vendor.bundle.js');

	if (fs.existsSync(vendorBundleJsFile.asNative)) {
		dependencies.push(`${bundlesLocation}/vendor.bundle`);
		dependencyVariables.push('vendor');
	}

	// TODO: check if file needs regeneration to avoid webpack rebuilds

	fs.ensureDirSync(moduleFile.dirname().asNative);
	fs.writeFileSync(
		moduleFile.asNative,
		await renderer.render('export-module', {
			dependencies: dependencies
				.map((dependency) => `'${dependency}'`)
				.join(',\n\t\t'),
			dependencyVariables: dependencyVariables.join(', '),
			moduleName,
		})
	);
}

async function writeLocalExportModule(
	id: string,
	moduleName: string
): Promise<void> {
	const moduleFile = project.outputDir.join(
		new FilePath(moduleName, {posix: true})
	);

	const {name, version} = project.pkgJson;

	moduleName = `${name}@${version}/${moduleName
		.replace('./', '')
		.replace(/\.js$/, '')}`;

	const bundlesLocation = moduleFile
		.dirname()
		.relative(project.outputDir)
		.toDotRelative().asPosix;

	await writeExportModule(moduleFile, id, moduleName, bundlesLocation);
}
