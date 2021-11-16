/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import globby from 'globby';
import path from 'path';
import readJsonSync from 'read-json-sync';

let cfg = {};
let savedProgramArgs = [];

reloadConfig();

/**
 * Reload config from current directory
 * @return {void}
 */
export function reloadConfig() {

	// Find project root path: uppermost folder with a .npmimportscheckrc file

	let projectRootPath = path.resolve(process.cwd());

	for (
		let dir = projectRootPath;
		path.dirname(dir) !== dir;
		dir = path.dirname(dir)
	) {
		if (fs.existsSync(path.join(dir, '.npmimportscheckrc'))) {
			projectRootPath = dir;
		}
	}

	const rootConfigPath = path.join(projectRootPath, '.npmimportscheckrc');

	// Read root configuration file

	cfg = safeReadJsonSync(rootConfigPath) || {};

	// Normalize configuration

	cfg['check-project-versions'] = cfg['check-project-versions'] || false;
	cfg['exclude-folders'] = cfg['exclude-folders'] || [];
	cfg['show-projects-load'] = cfg['show-projects-load'] || false;
	cfg['write-ignores'] = cfg['write-ignores'] || false;

	// Merge subconfiguration files recursively

	globby
		.sync(
			['**/.npmimportscheckrc', '!.npmimportscheckrc'].concat(
				getFolderExclusions()
			),
			{cwd: projectRootPath}
		)
		.forEach((filePath) => {
			cfg = mergeConfig(
				cfg,
				path.join(projectRootPath, path.dirname(filePath))
			);
		});

	// Override configuration with program arguments

	setProgramArgs(savedProgramArgs);

	// Store significant directories

	cfg['project-root-path'] = path.resolve(projectRootPath);
	cfg['run-path'] = path.resolve(process.cwd());
}

/**
 * Process program arguments to treat them as config.
 * @param {Array} args command line arguments
 * @return {void}
 */
export function setProgramArgs(args) {
	savedProgramArgs = args;

	if (args.includes('-i') || args.includes('--write-ignores')) {
		cfg['write-ignores'] = true;
	}

	if (args.includes('-l') || args.includes('--show-projects-load')) {
		cfg['show-projects-load'] = true;
	}

	if (args.includes('-p') || args.includes('--check-project-versions')) {
		cfg['check-project-versions'] = true;
	}
}

/**
 * Get the project's root path: uppermost folder with a .npmimportscheckrc file
 * @return {String} an absolute path
 */
export function getProjectRootPath() {
	return cfg['project-root-path'];
}

/**
 * Get the tool's run path
 * @return {String} an absolute path
 */
export function getRunPath() {
	return cfg['run-path'];
}

/**
 * Get the array of folder exclusions
 * @return {Array} an array of glob expressions to pass to globby
 */
export function getFolderExclusions() {
	return cfg['exclude-folders']
		.map((folder) => `!**/${folder}/**`)
		.concat(['!**/node_modules/**']);
}

/**
 * Test whether the program should show what projects are being loaded.
 * @return {Boolean} true if projects being loaded are to be shown.
 */
export function shouldShowProjectsLoad() {
	return cfg['show-projects-load'];
}

/**
 * Test whether the program should check if versions of packages in projects
 * match those specified in .npmbundlerrc files.
 * @return {Boolean} true if files should be checked
 */
export function shouldCheckProjectVersions() {
	return cfg['check-project-versions'];
}

/**
 * Test whether the program should write ignores to the .npmimportscheckrc
 * file
 * @return {Boolean} true if ignores should be written
 */
export function shouldWriteIgnores() {
	return cfg['write-ignores'];
}

/**
 * Checks if a certain import is ignored
 * @param  {String}  projectName project's name
 * @param  {String}  importsName imports' provider name
 * @param  {String}  pkgName imported package name
 * @return {Boolean} true if import should be ignored
 */
export function isIgnored(projectName, importsName, pkgName) {
	if (!cfg.ignore) {
		return false;
	}

	if (!cfg.ignore[projectName]) {
		return false;
	}

	if (!cfg.ignore[projectName][importsName]) {
		return false;
	}

	if (!cfg.ignore[projectName][importsName][pkgName]) {
		return false;
	}

	return true;
}

/**
 * Merge the configuration file of a directory with an existing configuration.
 * This method does not merge everything, but just the "ignore" field
 * namespacing it with the project's name.
 * @param  {Object} cfg the existing config
 * @param  {String} dir path where config file is stored
 * @return {Object} the merged config (passed in cfg argument)
 */
function mergeConfig(cfg, dir) {
	const rc = safeReadJsonSync(path.join(dir, '.npmimportscheckrc')) || {};

	const pkgJson = readJsonSync(path.join(dir, 'package.json'));

	const ignore = rc.ignore || {};

	Object.entries(ignore).forEach(([key, value]) => {
		ignore[key] = value.reduce((hash, item) => {
			hash[item] = true;

			return hash;
		}, {});
	});

	cfg.ignore = cfg.ignore || {};
	cfg.ignore[pkgJson.name] = ignore;

	return cfg;
}

/**
 * Read a JSON file not failing if it doesn't exist.
 * @param  {String} filePath path to file
 * @return {Object} the parsed JSON object or undefined if it could not be read
 */
function safeReadJsonSync(filePath) {
	filePath = path.resolve(filePath);

	let json;

	try {
		json = readJsonSync(filePath);
	}
	catch (err) {
		if (err.code !== 'ENOENT') {
			const msg = `(at ${filePath}) ${err.message}`;

			err.message = msg;
			throw err;
		}
	}

	return json;
}
