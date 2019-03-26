/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const process = require('process');

/**
 * Helper to generate string glob of soy dependencies
 * @param {Array.<string>} dependencies
 * @returns {string}
 */
module.exports = function(dependencies) {
	const cwd = process.cwd();

	const stringDependencies = dependencies
		.map(function(dependency) {
			let resolvedDependency = null;

			try {
				// Requires the `package.json` file to avoid resolving
				// the main entry point of the package so we can safely
				// infer the directory from the package root
				resolvedDependency = path.dirname(
					require.resolve(`${dependency}/package.json`)
				);
			} catch (err) {
				// Swallow.
			}

			return resolvedDependency;
		})
		.filter(Boolean)
		.filter(dependencyPath => dependencyPath !== cwd)
		.join(',');

	return `{${stringDependencies}}/src/**/*.soy`;
};
