/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const process = require('process');
const resolve = require('resolve');

/**
 * Helper to generate string glob of soy dependencies
 * @param {Array.<string>} dependencies
 * @returns {string}
 */
function generateSoyDependencies(dependencies) {
	const cwd = process.cwd();

	const projectName = path.basename(cwd);

	const stringDependencies = dependencies
		.map((dependency) => {
			let resolvedDependency = null;

			try {

				// Requires the `package.json` file to avoid resolving
				// the main entry point of the package so we can safely
				// infer the directory from the package root

				resolvedDependency = path.dirname(
					resolve.sync(`${dependency}/package.json`, {
						basedir: cwd,
					})
				);
			}
			catch (error) {

				// Swallow.

			}

			return resolvedDependency;
		})
		.filter(Boolean)
		.filter(
			(dependencyPath) => path.basename(dependencyPath) !== projectName
		);

	const joinedDependencies =
		stringDependencies.length === 1
			? stringDependencies
			: `{${stringDependencies.join(',')}}`;

	return `${joinedDependencies}/src/**/*.soy`;
}

module.exports = generateSoyDependencies;
