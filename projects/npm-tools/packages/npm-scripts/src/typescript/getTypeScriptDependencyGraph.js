/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getWorkspaces = require('../utils/getWorkspaces');

/**
 * Across the set of Yarn workspaces, determine the dependency graph of
 * TypeScript projects.
 *
 * Note that in the future, `tsc` itself may be able to do this for us.
 *
 * See: https://github.com/microsoft/TypeScript/issues/25376
 */
function getTypeScriptDependencyGraph() {
	const graph = {};

	getWorkspaces()
		.filter((workspace) => {
			return fs.existsSync(path.join(workspace, 'tsconfig.json'));
		})
		.map((workspace) => {
			const {dependencies, devDependencies, main, name} = JSON.parse(
				fs.readFileSync(path.join(workspace, 'package.json'), 'utf8')
			);

			return {
				dependencies: {
					...dependencies,
					...devDependencies,
				},
				directory: workspace,
				main,
				name,
			};
		})
		.forEach((project) => {
			if (graph[project.name]) {
				throw new Error(
					`getTypeScriptDependencyGraph(): duplicate project name ${project.name}`
				);
			}

			graph[project.name] = project;
		});

	Object.values(graph).forEach((project) => {
		Object.keys(project.dependencies).forEach((dependency) => {
			if (!graph[dependency]) {
				delete project.dependencies[dependency];
			}
		});
	});

	return graph;
}

module.exports = getTypeScriptDependencyGraph;
