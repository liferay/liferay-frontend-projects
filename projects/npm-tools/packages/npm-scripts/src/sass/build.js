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
			}
			else {
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
		outputStyle:
			process.env.NODE_ENV === 'production' ? 'compressed' : 'expanded',
		sourceMap: true,
	});

	return {...result, outputFile};
}

function copyFile(filePath, baseDir, outputDir) {
	const subDirectory = path.dirname(path.relative(baseDir, filePath));

	const buildDir = path.join(outputDir, subDirectory);

	const newfilePath = path.join(buildDir, path.basename(filePath));

	fs.mkdirSync(buildDir, {recursive: true});

	fs.copyFileSync(filePath, newfilePath);

	const fileStats = fs.statSync(filePath);

	fs.utimesSync(newfilePath, fileStats.atime, fileStats.mtime);

	return {buildDir, subDirectory};
}

const SASS_DIR = '.sass-cache';

function appendTimestamps(contentBuffer, timestamp) {
	let contentString = contentBuffer.toString();

	const matches = contentString.match(CSS_IMPORT_REGEX) || [];

	for (const match of matches) {
		contentString = contentString.replace(match, `${match}?t=${timestamp}`);
	}

	return contentString;
}

function convertAndWriteRTL(cssContent, filePath, outputDir) {
	const rtlCss = r2.swap(cssContent);

	const rtlCssFileName = `${path.parse(filePath).name}_rtl.css`;

	fs.writeFileSync(path.join(outputDir, rtlCssFileName), rtlCss);
}

function main(
	baseDir,
	{appendImportTimestamps = true, excludes, imports = [], rtl, outputDir = ''}
) {
	const {entryFiles, partials} = collectSassFiles(baseDir, excludes);
	const cssFiles = expandGlobs(['**/*.css'], excludes, {baseDir});

	const baseBuildDirectory = path.join(
		path.isAbsolute(outputDir) ? '' : CWD,
		outputDir
	);

	if (cssFiles.length) {
		for (const cssFile of cssFiles) {
			const {buildDir} = copyFile(cssFile, baseDir, baseBuildDirectory);

			if (rtl) {
				convertAndWriteRTL(
					fs.readFileSync(cssFile, 'utf8'),
					cssFile,
					buildDir
				);
			}
		}

		log(
			`CSS: Copied ${cssFiles.length} files${
				rtl ? ' and their RTL conversions' : ''
			}.`
		);
	}

	if (!entryFiles.length) {
		log(`BUILD SASS: No scss files found.`);

		return;
	}

	const sassBuildDirectory = path.join(baseBuildDirectory, SASS_DIR);

	for (const partial of partials) {
		copyFile(partial, baseDir, baseBuildDirectory);
	}

	const timestamp = Date.now();

	for (const file of entryFiles) {
		const {subDirectory} = copyFile(file, baseDir, baseBuildDirectory);

		const sassOutputDir = path.join(sassBuildDirectory, subDirectory);

		const {css, map, outputFile} = buildSass(file, sassOutputDir, imports);

		fs.mkdirSync(sassOutputDir, {recursive: true});

		let cssContent = css;

		if (appendImportTimestamps) {
			cssContent = Buffer.from(appendTimestamps(css, timestamp));
		}

		if (rtl) {
			convertAndWriteRTL(cssContent.toString(), file, sassOutputDir);
		}

		fs.writeFileSync(outputFile, cssContent);

		log(`BUILD SASS: Built ${path.relative(CWD, outputFile)}`);

		fs.writeFileSync(outputFile + '.map', map);
	}
}

module.exports = main;
