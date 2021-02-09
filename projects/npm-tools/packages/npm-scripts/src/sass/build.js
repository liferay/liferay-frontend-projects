/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const {r2} = require('liferay-theme-tasks');
const path = require('path');
const sass = require('sass');

const expandGlobs = require('../utils/expandGlobs');
const log = require('../utils/log');

const SASS_EXCLUDE = [
	'**/_diffs/**',
	'**/_sass_cache_*/**',
	'**/_styled/**',
	'**/_unstyled/**',
	'**/.sass-cache*/**',
	'**/build/**',
	'**/classes/**',
	'**/css/aui/**',
	'**/css/clay/**',
	'**/tmp/**',
];

const CWD = process.cwd();

const CSS_IMPORT_REGEX = /@import\s+url\s*\(\s*['"]?(.+?\.css)/g;

function collectSassFiles(baseDir, excludes = []) {
	const excludeGlobs = [...SASS_EXCLUDE, ...excludes];

	const files = expandGlobs(['**/*.scss'], excludeGlobs, {baseDir});

	return files.reduce(
		(acc, file) => {
			if (path.basename(file).match(/^_.+\.scss$/)) {
				acc.partials.push(file);
			} else {
				acc.entryFiles.push(file);
			}

			return acc;
		},
		{entryFiles: [], partials: []}
	);
}

function buildSass(file, outputDir, includePaths) {
	const cssFileName = path.basename(file).replace(/\.scss$/, '.css');

	const outputFile = path.join(outputDir, cssFileName);

	const result = sass.renderSync({
		file,
		includePaths,
		outFile: outputFile,
		sourceMap: true,
	});

	return {...result, outputFile};
}

function copyCss(filePath, newDirectory) {
	const newfilePath = path.join(newDirectory, path.basename(filePath));

	fs.mkdirSync(newDirectory, {recursive: true});

	fs.copyFileSync(filePath, newfilePath);

	const fileStats = fs.statSync(filePath);

	fs.utimesSync(newfilePath, fileStats.atime, fileStats.mtime);
}

const SASS_DIR = '.sass-cache';

function isModified(filePaths, buildDirectory, baseDir) {
	for (const filePath of filePaths) {
		const subDirectory = path.dirname(path.relative(baseDir, filePath));

		const cachedFile = path.join(
			buildDirectory,
			subDirectory,
			path.basename(filePath)
		);

		if (!fs.existsSync(cachedFile)) {
			return true;
		}

		const cachedFileStats = fs.statSync(cachedFile);
		const srcFileStats = fs.statSync(filePath);

		if (cachedFileStats.mtime.getTime() !== srcFileStats.mtime.getTime()) {
			return true;
		}
	}

	return false;
}

function appendTimestamps(contentBuffer, timestamp) {
	let contentString = contentBuffer.toString();

	const matches = contentString.match(CSS_IMPORT_REGEX) || [];

	for (const match of matches) {
		contentString = contentString.replace(match, `${match}?t=${timestamp}`);
	}

	return contentString;
}

function main(
	baseDir,
	{appendImportTimestamps = true, excludes, imports = [], rtl, outputDir = ''}
) {
	const {entryFiles, partials} = collectSassFiles(baseDir, excludes);

	if (!entryFiles.length) {
		log(`BUILD CSS: No files found.`);

		return;
	}

	if (!isModified([...entryFiles, ...partials], outputDir, baseDir)) {
		log(`BUILD CSS: Skipped, no changes detected.`);

		return;
	}

	const baseBuildDirectory = path.join(
		path.isAbsolute(outputDir) ? '' : CWD,
		outputDir
	);

	const sassBuildDirectory = path.join(baseBuildDirectory, SASS_DIR);

	for (const partial of partials) {
		const subDirectory = path.dirname(path.relative(baseDir, partial));

		const baseOutputDir = path.join(baseBuildDirectory, subDirectory);

		copyCss(partial, baseOutputDir);
	}

	const timestamp = Date.now();

	for (const file of entryFiles) {
		const subDirectory = path.dirname(path.relative(baseDir, file));

		const baseOutputDir = path.join(baseBuildDirectory, subDirectory);
		const sassOutputDir = path.join(sassBuildDirectory, subDirectory);

		copyCss(file, baseOutputDir);

		const {css, map, outputFile} = buildSass(file, sassOutputDir, imports);

		fs.mkdirSync(sassOutputDir, {recursive: true});

		let cssContent = css;

		if (appendImportTimestamps) {
			cssContent = Buffer.from(appendTimestamps(css, timestamp));
		}

		if (rtl) {
			const rtlCss = r2.swap(cssContent.toString());

			const rtlCssFileName = `${path
				.basename(file)
				.replace(/\.scss$/, '')}_rtl.css`;

			fs.writeFileSync(path.join(sassOutputDir, rtlCssFileName), rtlCss);
		}

		fs.writeFileSync(outputFile, cssContent);

		log(`Sass: Built ${path.relative(CWD, outputFile)}`);

		fs.writeFileSync(outputFile + '.map', map);
	}
}

module.exports = main;
