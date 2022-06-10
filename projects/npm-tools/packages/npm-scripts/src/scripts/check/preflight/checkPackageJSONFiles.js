/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const expandGlobs = require('../../../utils/expandGlobs');
const getMergedConfig = require('../../../utils/getMergedConfig');
const getPaths = require('../../../utils/getPaths');

const IGNORE_FILE = '.eslintignore';

const ALLOWED_NAMED_SCOPE_EXCEPTIONS = 'allowed-named-scope-exceptions';
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
	const packages = getPaths(['package.json'], [], IGNORE_FILE);

	const {rules} = getMergedConfig('npmscripts') || {};

	const errors = [];

	const allowedNamedScopeExceptions = new Set(
		rules[ALLOWED_NAMED_SCOPE_EXCEPTIONS] || []
	);

	const bannedDependenies = (rules[BANNED_DEPENDENCY_PATTERNS] || []).map(
		(pattern) => {
			return new RegExp(pattern);
		}
	);

	packages.forEach((pkg) => {
		const bad = (message) => errors.push(`${pkg}: BAD - ${message}`);

		try {
			const {dependencies, name, main} = JSON.parse(
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
