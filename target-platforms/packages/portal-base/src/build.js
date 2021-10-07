/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const babel = require('@babel/core');
const childProcess = require('child_process');
const fs = require('fs');
const {
	error: fail,
	info,
	print,
	success,
} = require('liferay-npm-build-tools-common/lib/format');
const {
	default: project,
} = require('liferay-npm-build-tools-common/lib/project');
const path = require('path');
const sass = require('sass');

const findFiles = require('./util/findFiles');
const sassImporter = require('./util/sassImporter');

const srcDir = project.dir.join('src');
const {buildDir} = project;

module.exports = function build() {
	fs.mkdirSync(buildDir.asNative, {recursive: true});

	copyAssets();
	runSass();
	runCompiler();
	runBundler();

	print(success`{Project successfully built}`);
};

function abort(error) {
	if (error.stack) {
		print(error.stack);
	}
	else {
		print(error.toString());
	}

	print(fail`Build failed`);
	process.exit(1);
}

function copyAssets() {
	const assetFiles = findFiles(srcDir, (dirent) => {
		const lowerCaseName = dirent.name.toLowerCase();

		return (
			!lowerCaseName.endsWith('.js') && !lowerCaseName.endsWith('.scss')
		);
	});

	print(info`Copying ${assetFiles.length} {assets}...`);

	assetFiles.forEach((assetFile) => {
		const srcDirRelAssetFile = srcDir.relative(assetFile);
		const outFile = buildDir.join(srcDirRelAssetFile);

		try {
			fs.mkdirSync(outFile.dirname().asNative, {recursive: true});
			fs.copyFileSync(assetFile.asNative, outFile.asNative);
		}
		catch (error) {
			abort(error);
		}
	});
}

function runBabel() {
	const jsFiles = findFiles(srcDir, (dirent) =>
		dirent.name.toLowerCase().endsWith('.js')
	);

	print(info`Running {babel} on ${jsFiles.length} files...`);

	jsFiles.forEach((jsFile) => {
		const srcDirRelJsFile = srcDir.relative(jsFile);

		try {
			const {code, map} = babel.transformSync(
				fs.readFileSync(jsFile.asNative, 'utf8'),
				{
					filename: jsFile.asNative,
					presets: [
						require('@babel/preset-env'),
						require('@babel/preset-react'),
					],
					sourceMaps: true,
				}
			);

			fs.writeFileSync(
				buildDir.join(srcDirRelJsFile).asNative,
				code,
				'utf8'
			);

			fs.writeFileSync(
				buildDir.join(`${srcDirRelJsFile}.map`).asNative,
				JSON.stringify(map),
				'utf8'
			);
		}
		catch (babelError) {
			abort(babelError);
		}
	});
}

function runCompiler() {
	const dependencies = project.pkgJson.dependencies || {};
	const devDependencies = project.pkgJson.devDependencies || {};

	if (devDependencies['typescript'] || dependencies['typescript']) {
		runTsc();
	}
	else {
		runBabel();
	}
}

function runBundler() {
	const bundlerPkgJsonPath = require.resolve(
		'liferay-npm-bundler/package.json'
	);
	const bundlerDir = path.dirname(bundlerPkgJsonPath);

	/* eslint-disable-next-line @liferay/no-dynamic-require */
	const bundlerPkgJson = require(bundlerPkgJsonPath);
	const bundlerPath = path.resolve(
		bundlerDir,
		bundlerPkgJson.bin['liferay-npm-bundler']
	);

	print(info`Running {liferay-npm-bundler}...`);

	spawn('node', [bundlerPath]);
}

function runSass() {
	const scssFiles = findFiles(srcDir, (dirent) => {
		const lowerCaseName = dirent.name.toLowerCase();

		return (
			lowerCaseName.endsWith('.scss') && !lowerCaseName.startsWith('_')
		);
	});
	print(info`Running {sass} on ${scssFiles.length} files...`);

	scssFiles.forEach((scssFile) => {
		const srcDirRelScssFile = srcDir.relative(scssFile);
		const outFile = buildDir.join(
			srcDirRelScssFile.asNative.replace(/\.scss$/, '.css')
		);

		try {
			const {css, map} = sass.renderSync({
				file: scssFile.asNative,
				importer: sassImporter,
				outFile: outFile.asNative,
				sourceMap: true,
			});

			fs.mkdirSync(outFile.dirname().asNative, {recursive: true});

			fs.writeFileSync(outFile.asNative, css, 'utf8');

			fs.writeFileSync(`${outFile.asNative}.map`, map, 'utf8');
		}
		catch (error) {
			abort(error);
		}
	});
}

function runTsc() {
	print(info`Running {tsc} compiler...`);

	spawn('npx', ['tsc']);
}

function spawn(bin, args) {
	const {error, signal, status} = childProcess.spawnSync(bin, args, {
		stdio: 'inherit',
	});

	if (error) {
		abort(error);
	}

	if (signal) {
		abort(`{${bin}} received signal: ${signal}`);
	}

	if (status !== 0) {
		abort(`{${bin}} exited with status: ${status}`);
	}
}
