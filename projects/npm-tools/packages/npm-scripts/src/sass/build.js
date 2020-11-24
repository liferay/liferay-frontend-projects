/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const r2 = require('liferay-r2');
const path = require('path');
const sass = require('sass');

const expandGlobs = require('../utils/expandGlobs');
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

const SASS_INCLUDE = ['**/*.scss'];

function collectSassFiles(baseDir, excludes = []) {
	const excludeGlobs = [...SASS_EXCLUDE, ...excludes];

	return expandGlobs(SASS_INCLUDE, excludeGlobs, {baseDir});
}

function buildSass(file, output, includePaths) {
	const cssFileName = path.basename(file).replace(/\.scss$/, '.css');

	const outputFile = path.join(output, cssFileName);

	const result = sass.renderSync({
		file,
		includePaths,
		outFile: outputFile,
		sourceMap: true,
	});

	return {...result, outputFile};
}

function copyCss(filePath, newDirectory) {
	fs.mkdirSync(newDirectory, {recursive: true});

	fs.copyFileSync(filePath, path.join(newDirectory, path.basename(filePath)));
}

const SASS_DIR = '.sass-cache';

function main(baseDir, {excludes, imports = [], outputDir = '', rtl = false}) {
	const files = collectSassFiles(baseDir, excludes);

	if (!files.length) {
		log(`BUILD CSS: No files found.`);

		return;
	}

	for (const file of files) {
		const baseBuildDirectory = path.join(
			path.isAbsolute(outputDir) ? '' : baseDir,
			outputDir,
			path.dirname(path.relative(baseDir, file))
		);

		const sassBuildDirectory = path.join(baseBuildDirectory, SASS_DIR);

		copyCss(file, baseBuildDirectory);

		const {css, outputFile, sourceMap} = buildSass(
			file,
			sassBuildDirectory,
			imports
		);

		fs.mkdirSync(sassBuildDirectory, {recursive: true});

		if (rtl) {
			fs.writeFileSync(
				outputFile.replace(/\.css$/, '_rtl.css'),
				r2.swap(css.toString())
			);
		}

		fs.writeFileSync(outputFile, css);
		fs.writeFileSync(outputFile + '.map', sourceMap);
	}
}

module.exports = main;
