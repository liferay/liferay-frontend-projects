/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

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
			const {dependencies, name} = JSON.parse(
				fs.readFileSync(pkg),
				'utf8'
			);

			// Check for bad package names.

			if (
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
		}
		catch (error) {
			bad(`error thrown during checks: ${error}`);
		}
	});

	return errors;
}

module.exports = checkPackageJSONFiles;
