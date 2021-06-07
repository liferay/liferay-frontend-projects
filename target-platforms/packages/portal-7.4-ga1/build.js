/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @liferay/liferay/no-dynamic-require */

const babel = require('@babel/core');
const childProcess = require('child_process');
const fs = require('fs');
const {
	error,
	info,
	print,
	success,
} = require('liferay-npm-build-tools-common/lib/format');
const {
	default: project,
} = require('liferay-npm-build-tools-common/lib/project');
const path = require('path');

const srcDir = project.dir.join('src');
const {buildDir} = project;

module.exports = function build() {
	fs.mkdirSync(buildDir.asNative, {recursive: true});

	runBabel();
	runBundler();

	print(success`{Project successfully built}`);
};

function findJsFiles(dir) {
	dir = dir || srcDir;

	return fs
		.readdirSync(dir.asNative, {withFileTypes: true})
		.reduce((jsFiles, dirent) => {
			if (dirent.isDirectory()) {
				jsFiles.push(...findJsFiles(dir.join(dirent.name)));
			}
			else if (
				dirent.isFile() &&
				dirent.name.toLowerCase().endsWith('.js')
			) {
				jsFiles.push(dir.join(dirent.name));
			}

			return jsFiles;
		}, []);
}

function runBabel() {
	const jsFiles = findJsFiles();

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
		catch (error) {
			/* eslint-disable-next-line no-console */
			console.log(error.toString());
			print(error`Build failed`);
			process.exit(1);
		}
	});
}

function runBundler() {
	const bundlerPkgJsonPath = require.resolve(
		'liferay-npm-bundler/package.json'
	);
	const bundlerDir = path.dirname(bundlerPkgJsonPath);
	const bundlerPkgJson = require(bundlerPkgJsonPath);
	const bundlerPath = path.resolve(
		bundlerDir,
		bundlerPkgJson.bin['liferay-npm-bundler']
	);

	print(info`Running {liferay-npm-bundler}...`);

	childProcess.spawnSync('node', [bundlerPath], {
		stdio: 'inherit',
	});
}
