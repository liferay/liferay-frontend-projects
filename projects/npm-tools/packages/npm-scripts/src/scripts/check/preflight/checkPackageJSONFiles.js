/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const collectDefinedDependencies = require('../../../utils/collectDefinedDependencies');
const getMergedConfig = require('../../../utils/getMergedConfig');
const getPaths = require('../../../utils/getPaths');

const IGNORE_FILE = '.eslintignore';

const ALLOWED_NAMED_SCOPE_EXCEPTIONS = 'allowed-named-scope-exceptions';
const ALLOWED_NON_GLOBAL_DEPENDENCIES = 'allowed-non-global-dependencies';
const BANNED_DEPENDENCY_PATTERNS = 'blacklisted-dependency-patterns';

/**
 * Runs checks against package.json files; detects:
 *
 * - Bad package names (ie. packages without named scopes).
 * - Banned dependencies.
 *
 * Returns a (possibly empty) array of error messages.
 */
function checkPackageJSONFiles() {
	let packages = getPaths(['package.json'], [], IGNORE_FILE);

	// Filters out packages that have their own yarn.lock

	packages = packages.filter((packagePath) => {

		// Ignore root level package.json

		if (packagePath === 'package.json') {
			return true;
		}

		return !fs.existsSync(
			path.join(path.dirname(packagePath), 'yarn.lock')
		);
	});

	const {rules} = getMergedConfig('npmscripts') || {};

	const errors = [];

	const allowedNamedScopeExceptions = new Set(
		rules[ALLOWED_NAMED_SCOPE_EXCEPTIONS] || []
	);

	const allowedNonGlobalDependencies =
		rules[ALLOWED_NON_GLOBAL_DEPENDENCIES] || [];
	const bannedDependenies = (rules[BANNED_DEPENDENCY_PATTERNS] || []).map(
		(pattern) => {
			return new RegExp(pattern);
		}
	);

	const definedDependenciesSet = collectDefinedDependencies();

	packages.forEach((pkg) => {
		const bad = (message) => errors.push(`${pkg}: BAD - ${message}`);

		try {
			const {dependencies, main, name} = JSON.parse(
				fs.readFileSync(pkg),
				'utf8'
			);

			// Check for bad package names.

			if (
				name &&
				!name.startsWith('@liferay/') &&
				!allowedNamedScopeExceptions.has(name)
			) {
				bad(
					`package name ${name} should be under @liferay/ named scope - https://git.io/JOgy7`
				);
			}

			// Check for banned dependencies.

			const dependencyNames = dependencies
				? Object.keys(dependencies)
				: [];

			dependencyNames.forEach((name) => {
				if (
					!definedDependenciesSet.has(name) &&
					!allowedNonGlobalDependencies.includes(name)
				) {
					bad(
						`dependency not provided by a specific module: ${name} - See https://issues.liferay.com/browse/LPS-168443`
					);
				}

				bannedDependenies.forEach((pattern) => {
					if (pattern.test(name)) {
						bad(
							`contains blacklisted dependency: ${name} - https://git.io/JOgyj`
						);
					}
				});
			});

			// Check for main entry point

			if (!main) {
				const moduleDir = path.join(pkg, '..');

				const indexExists = [
					'index.js',
					'index.es.js',
					'index.ts',
					'index.tsx',
				].find(
					(file) =>
						fs.existsSync(
							path.join(
								moduleDir,
								'src/main/resources/META-INF/resources',
								file
							)
						) ||
						fs.existsSync(
							path.join(
								moduleDir,
								'src/main/resources/META-INF/resources/js',
								file
							)
						)
				);

				if (indexExists) {
					bad(
						`package.json doesn't contain a "main" entry point when you have an ${indexExists} file - https://github.com/liferay/liferay-frontend-projects/issues/719`
					);
				}
			}
		}
		catch (error) {
			bad(`error thrown during checks: ${error}`);
		}
	});

	return errors;
}

module.exports = checkPackageJSONFiles;
