/**
 * SPDX-FileCopyrightText: © 2022 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const expandGlobs = require('./expandGlobs');
const findRoot = require('./findRoot');

const CWD = process.cwd();
const root = findRoot();

const npmScriptsCacheDir = path.join(root, '.npmscripts', 'build');
const artifactCache = path.join(npmScriptsCacheDir, 'artifacts');

const BUILD_INFO_FILE_NAME = 'buildinfo.json';

/**
 * Util for removing the cache directory
 * @param {string} moduleName name found in package.json of module
 */
const cleanCache = (moduleName) => {
	const moduleCachePath = path.join(artifactCache, moduleName);

	if (fs.existsSync(moduleCachePath)) {
		fs.rmdirSync(moduleCachePath, {recursive: true});
	}
};

/**
 * Creates a unique has for the content of a file
 *
 * @param {string} filePath path to file
 * @return {string} hash of file content
 */
const hashFile = (filePath) => {
	const fileBuffer = fs.readFileSync(filePath);
	const hashSum = crypto.createHash('sha1');
	hashSum.update(fileBuffer);

	return hashSum.digest('hex');
};

/**
 * Determines if the cache found in `modules/.npmscripts/build` is valid
 *
 * @param {string} moduleName name found in package.json of module
 * @param {Array.<string>} srcFiles paths to source files
 * @return {boolean} whether cache is valid or not
 */
function isCacheValid(moduleName, srcFiles) {
	let moduleBuildInfo;

	const moduleBuildInfoPath = path.join(
		artifactCache,
		moduleName,
		BUILD_INFO_FILE_NAME
	);

	if (!fs.existsSync(moduleBuildInfoPath)) {
		return false;
	}

	try {
		moduleBuildInfo = JSON.parse(
			fs.readFileSync(moduleBuildInfoPath, 'utf8')
		);
	}
	catch (error) {
		return false;
	}

	if (!moduleBuildInfo) {
		return false;
	}

	const previousSrcFiles = Object.keys(moduleBuildInfo.srcFiles);

	// Check if any source files have been added or removed

	if (srcFiles.length !== previousSrcFiles.length) {
		return false;
	}

	// Check if source files content has changed

	for (const prevSrcFilePath of previousSrcFiles) {
		if (
			!fs.existsSync(prevSrcFilePath) ||
			moduleBuildInfo.srcFiles[prevSrcFilePath] !==
				hashFile(prevSrcFilePath)
		) {
			return false;
		}
	}

	// Check if the built files still exist from last build

	const previousBuiltFiles = Object.keys(moduleBuildInfo.builtFiles);

	for (const prevBuiltFilePath of previousBuiltFiles) {
		if (
			!fs.existsSync(prevBuiltFilePath) ||
			moduleBuildInfo.srcFiles[prevBuiltFilePath] !==
				hashFile(prevBuiltFilePath)
		) {
			restoreBuildArtifact(prevBuiltFilePath, moduleName);
		}
	}

	return true;
}

/**
 * Sets the cache info and copies over files
 *
 * @param {string} moduleName name found in package.json of module
 * @param {Array.<string>} srcFiles paths to source files
 * @param {string} output relative path to where the source files are build
 */
function setCache(moduleName, srcFiles, output) {
	const moduleArtifactCachePath = path.join(artifactCache, moduleName);

	if (!fs.existsSync(moduleArtifactCachePath)) {
		fs.mkdirSync(moduleArtifactCachePath, {recursive: true});
	}

	const builtFiles = expandGlobs(
		[
			output + '/**/*.css',
			output + '/**/*.js',
			output + '/**/*.json',
			output + '/**/*.jsx',
			output + '/**/*.map',
			output + '/**/*.scss',
			output + '/**/*.soy',
			output + '/**/*.ts',
			output + '/**/*.tsx',
		],
		[]
	);

	const moduleBuildInfo = {
		builtFiles: builtFiles.reduce(
			(acc, filePath) => ({...acc, [filePath]: hashFile(filePath)}),
			{}
		),
		srcFiles: srcFiles.reduce(
			(acc, filePath) => ({...acc, [filePath]: hashFile(filePath)}),
			{}
		),
	};

	fs.writeFileSync(
		path.join(moduleArtifactCachePath, BUILD_INFO_FILE_NAME),
		JSON.stringify(moduleBuildInfo)
	);

	storeBuildArtifacts(builtFiles, moduleName);
}

/**
 * Restores file from the cache to the build directory
 *
 * @param {string} filePath path of file in module
 * @param {string} moduleName name found in package.json of module
 */
function restoreBuildArtifact(filePath, moduleName) {
	const artifactPath = path.join(artifactCache, moduleName, filePath);

	if (fs.existsSync(artifactPath)) {
		const buildPath = path.join(CWD, filePath);

		const buildDir = path.dirname(buildPath);

		if (!fs.existsSync(buildDir)) {
			fs.mkdirSync(buildDir, {recursive: true});
		}

		fs.copyFileSync(artifactPath, buildPath);
	}
}

/**
 * Stores build artifacts to the cache directory
 *
 * @param {Array.<string>} files paths to build artifacts
 * @param {string} moduleName name found in package.json of module
 */
function storeBuildArtifacts(files, moduleName) {
	const artifactDir = path.join(artifactCache, moduleName);

	for (const filePath of files) {
		const fullFilePath = path.join(CWD, filePath);

		if (fs.existsSync(fullFilePath)) {
			const artifactPath = path.join(artifactDir, filePath);

			const dir = path.dirname(artifactPath);

			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, {recursive: true});
			}

			fs.copyFileSync(fullFilePath, artifactPath);
		}
	}
}

module.exports = {
	cleanCache,
	isCacheValid,
	setCache,
};
