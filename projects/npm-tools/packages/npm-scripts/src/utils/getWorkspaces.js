/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const expandGlobs = require('./expandGlobs');
const findRoot = require('./findRoot');
const log = require('./log');

/**
 * Returns a list of workspaces.
 *
 * These are directories containing "package.json" files in locations
 * that match the top-level "workspaces" globs defined in
 * "modules/package.json".
 */
function getWorkspaces() {
	const root = findRoot();

	if (root) {
		const cwd = process.cwd();

		try {
			process.chdir(root);

			const {workspaces} = JSON.parse(
				fs.readFileSync('package.json', 'utf8')
			);

			const projects = expandGlobs(
				workspaces.packages,
				[
					'**/node_modules/**',
					'**/.releng/**',
					'**/.npmscripts/**',
					'**/build',
					'**/classes',
					'**/src',
					'**/test',
				],
				{
					maxDepth: 4,
					type: 'directory',
				}
			);

			return projects
				.filter((project) => {
					const packageJson = path.join(project, 'package.json');

					return fs.existsSync(packageJson);
				})
				.map((project) => {
					return path.join(root, project);
				});
		}
		catch (error) {
			log(`getWorkspaces(): error \`${error}\``);
		}
		finally {
			process.chdir(cwd);
		}
	}

	return [];
}

module.exports = getWorkspaces;
