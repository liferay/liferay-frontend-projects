/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const getMergedConfig = require('../../../utils/getMergedConfig');
const getPaths = require('../../../utils/getPaths');

const IGNORE_FILE = '.eslintignore';

const BLACKLISTED_DEPENDENCY_PATTERNS = 'blacklisted-dependency-patterns';

/**
 * Runs checks against package.json files.
 *
 * Returns a (possibly empty) array of error messages.
 */
function checkPackageJSONFiles() {
	const packages = getPaths(['package.json'], [], IGNORE_FILE);

	const {rules} = getMergedConfig('npmscripts') || {};

	const errors = [];

	if (rules[BLACKLISTED_DEPENDENCY_PATTERNS]) {
		const blacklist = rules[BLACKLISTED_DEPENDENCY_PATTERNS].map(
			(pattern) => {
				return new RegExp(pattern);
			}
		);

		packages.forEach((pkg) => {
			try {
				const {dependencies} = JSON.parse(fs.readFileSync(pkg), 'utf8');

				const names = dependencies ? Object.keys(dependencies) : [];

				names.forEach((name) => {
					blacklist.forEach((pattern) => {
						if (pattern.test(name)) {
							errors.push(
								`${pkg}: BAD - contains blacklisted dependency: ${name}`
							);
						}
					});
				});
			}
			catch (error) {
				errors.push(
					`${pkg}: BAD - error thrown during checks: ${error}`
				);
			}
		});
	}

	return errors;
}

module.exports = checkPackageJSONFiles;
