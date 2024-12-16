/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

const PERMANENT = 'permanent';
const TEMPORARY = 'temporary';

module.exports = function getProjectDirectories() {
	const packagesDir = path.join(__dirname, '..', '..', 'packages');

	const packages = {};

	fs.readdirSync(packagesDir, {withFileTypes: true})
		.filter((entry) => entry.isDirectory())
		.forEach((entry) => {
			const info = JSON.parse(
				fs.readFileSync(
					path.join(packagesDir, entry.name, 'package.json'),
					'utf8'
				)
			);

			packages[info.name] = {
				...info,
				dirName: entry.name,
			};
		});

	const ordered = [];

	Object.values(packages).forEach((node) => {
		if (!node.mark) {
			visit(node, packages, ordered);
		}
	});

	return ordered.map((projectName) => path.resolve(packagesDir, projectName));
};

/**
 * Obtain topological ordering via DFS.
 *
 * See: https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
 */
function visit(node, packages, ordered) {
	if (node.mark === PERMANENT) {
		return;
	}
	else if (node.mark === TEMPORARY) {
		throw new Error(
			`Cycle detected in dependency graph (node: ${node.name})`
		);
	}

	node.mark = TEMPORARY;

	Object.keys(node.dependencies || {}).forEach((other) => {
		if (packages[other]) {
			visit(packages[other], packages, ordered);
		}
	});

	node.mark = PERMANENT;

	ordered.push(node.dirName);
}
