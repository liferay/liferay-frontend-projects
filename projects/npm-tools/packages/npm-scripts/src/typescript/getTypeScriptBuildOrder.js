/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Figure out necessary build order via topological sort.
 */
function getTypeScriptBuildOrder(graph) {
	const order = [];

	const done = new Set();

	function visit(item, pending = new Set()) {
		pending.add(item);

		Object.keys(item.dependencies).forEach((dependency) => {
			const project = graph[dependency];

			checkCycle(pending, project);

			if (!done.has(project)) {
				visit(project, pending);
			}
		});

		order.push(item);
		pending.delete(item);
		done.add(item);
	}

	const projects = Object.values(graph);

	projects.forEach((project) => {
		if (!done.has(project)) {
			visit(project);
		}
	});

	return order;
}

function checkCycle(pending, project) {
	if (pending.has(project)) {
		const projects = Array.from(pending).concat([project]);

		projects.splice(0, projects.indexOf(project));

		throw new Error(
			`getTypeScriptBuildOrder(): dependency cycle detected ${projects
				.map(({name}) => name)
				.join(' -> ')}`
		);
	}
}

module.exports = getTypeScriptBuildOrder;
