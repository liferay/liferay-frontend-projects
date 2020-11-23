/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const globby = require('globby');
const r2 = require('liferay-r2');
const path = require('path');
const sass = require('sass');

const log = require('../utils/log');

const SASS_EXCLUDE = [
	'**/_*.scss',
	'**/build/**',
	'**/classes/**',

	// Copy from CSSBuilderArgs.java

	'**/_diffs/**',
	'**/.sass-cache*/**',
	'**/.sass_cache_*/**',
	'**/_sass_cache_*/**',
	'**/_styled/**',
	'**/_unstyled/**',
	'**/css/aui/**',
	'**/css/clay/**',
	'**/tmp/**',
];

async function collectSassFiles(baseDir, excludes = []) {
	const excludePaths = [
		...SASS_EXCLUDE.map((exclude) => path.join(baseDir, exclude)),
		...excludes.map((exclude) => path.join(baseDir, exclude)),
	];

	return await globby([
		path.join(baseDir, '**/*.scss'),
		...excludePaths.map((exclude) => `!${exclude}`),
	]);
}

function buildSass(file, output, includePaths) {
	const newFileName = file
		.split('/')
		[file.split('/').length - 1].replace('.scss', '.css');

	const outputFile = path.join(output, newFileName);

	const result = sass.renderSync({
		file,
		includePaths,
		outFile: outputFile,
		sourceMap: true,
	});

	return [outputFile, result.css, result.map];
}

function copyCss(filePath, newDirectory) {
	if (!fs.existsSync(newDirectory)) {
		fs.mkdirSync(newDirectory, {recursive: true});
	}

	fs.copyFileSync(filePath, path.join(newDirectory, path.basename(filePath)));
}

const SASS_DIR = '.sass-cache';

async function main(
	baseDir,
	{excludes, imports = [], outputDir = '', rtl = false}
) {
	const files = await collectSassFiles(baseDir, excludes);

	if (!files.length) {
		log(`BUILD CSS: No files found.`);

		return;
	}

	for (let i = 0; i < files.length; i++) {
		const file = files[i];

		const baseBuildDirectory = path.join(
			baseDir,
			outputDir,
			path.parse(file).dir.replace(baseDir, '')
		);

		const sassBuildDirectory = path.join(baseBuildDirectory, SASS_DIR);

		copyCss(file, baseBuildDirectory);

		const [outputFile, css, sourceMap] = buildSass(
			file,
			sassBuildDirectory,
			imports
		);

		if (!fs.existsSync(sassBuildDirectory)) {
			fs.mkdirSync(sassBuildDirectory, {recursive: true});
		}

		if (rtl) {
			fs.writeFileSync(
				outputFile.replace('.css', '_rtl.css'),
				r2.swap(css.toString())
			);
		}

		fs.writeFileSync(outputFile, css);
		fs.writeFileSync(outputFile + '.map', sourceMap);
	}
}

module.exports = main;
