/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

const packages = {};

let target = process.argv[2];

if (!target) {
	log('no explicit target directory argument provided; assuming "packages"');

	target = 'packages';
}

fs.readdirSync(target, {withFileTypes: true}).forEach((entry) => {
	if (entry.isDirectory()) {
		const info = JSON.parse(
			fs.readFileSync(
				path.join(target, entry.name, 'package.json'),
				'utf8'
			)
		);

		packages[info.name] = info;
	}
});

function log(string) {
	process.stderr.write(`${string}\n`);
}

/**
 * Obtain topological ordering via DFS.
 *
 * See: https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
 */

const ordered = [];

const CYCLE_MESSAGE = 'Cycle detected in dependency graph';

const PERMANENT = 'permanent';

const TEMPORARY = 'temporary';

Object.values(packages).forEach((node) => {
	if (!node.mark) {
		visit(node);
	}
});

function visit(node) {
	try {
		if (node.mark === PERMANENT) {
			return;
		}
		else if (node.mark === TEMPORARY) {
			log(`${CYCLE_MESSAGE}\n`);

			throw new Error(CYCLE_MESSAGE);
		}

		node.mark = TEMPORARY;

		Object.keys(node.dependencies || {}).forEach((other) => {
			if (packages[other]) {
				visit(packages[other]);
			}
		});

		node.mark = PERMANENT;

		ordered.push(node.name);
	}
	catch (error) {

		// Log the package name so we can see the cycle as we unwind the stack.

		log(`  ${node.name}\n`);

		throw error;
	}
}

process.stdout.write(JSON.stringify(ordered, null, 2) + '\n');
