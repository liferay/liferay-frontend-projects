/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getTypeScriptBuildOrder = require('../typescript/getTypeScriptBuildOrder');
const getTypeScriptDependencyGraph = require('../typescript/getTypeScriptDependencyGraph');
const runTSC = require('../typescript/runTSC');
const findRoot = require('../utils/findRoot');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');

async function types() {
	const cwd = process.cwd();
	const root = findRoot();

	if (root && root !== cwd) {
		log(
			'You ran "liferay-npm-scripts types" from:',
			'',
			`    ${path.relative(root, process.cwd())}`,
			'',
			'But generating types is a global process; will run from:',
			'',
			`    ${root}`,
			''
		);
	}

	const graph = getTypeScriptDependencyGraph();

	const projects = getTypeScriptBuildOrder(graph);

	let upToDateCount = 0;

	for (let i = 0; i < projects.length; i++) {
		const {directory, name} = projects[i];

		try {
			process.chdir(directory);

			const buildInfoPath = path.join(
				process.cwd(),
				'tmp',
				'tsconfig.tsbuildinfo'
			);

			// Remove previous type information to ensure a consistent build

			if (fs.existsSync(buildInfoPath)) {
				fs.unlinkSync(buildInfoPath);
			}

			const config = getMergedConfig('npmscripts');

			const {build: BUILD_CONFIG} = config;

			if (BUILD_CONFIG.tsc !== false) {
				log(
					`Generating types (${i + 1} of ${projects.length}): ${name}`
				);

				if (await runTSC()) {
					upToDateCount++;
				}
			}
			else {
				log(
					`Skipping types for (${i + 1} of ${
						projects.length
					}): ${name}(config.build.tsc=false)`
				);

				upToDateCount++;
			}
		}
		finally {
			process.chdir(cwd);
		}
	}

	const staleCount = projects.length - upToDateCount;

	if (staleCount) {
		const description =
			staleCount === 1 ? '1 project was' : `${staleCount} projects were`;

		throw new Error(
			`Type generation was successful but ${description} out of date. ` +
				'Please commit updated versions of the artifacts in the projects listed above.'
		);
	}
}

module.exports = types;
