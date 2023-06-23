/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const getTypeScriptBuildOrder = require('../typescript/getTypeScriptBuildOrder');
const getTypeScriptDependencyGraph = require('../typescript/getTypeScriptDependencyGraph');
const runTSC = require('../typescript/runTSC');
const findRoot = require('../utils/findRoot');
const getLiferayWorkingBranch = require('../utils/getLiferayWorkingBranch');
const getMergedConfig = require('../utils/getMergedConfig');
const git = require('../utils/git');
const log = require('../utils/log');

function tsDiffFromWorkingBranch() {
	const upstream = getLiferayWorkingBranch();

	const mergeBase = git('merge-base', 'HEAD', upstream);

	const diff = git('diff', mergeBase, '--name-only');

	const changedFiles = diff
		.split('\n')
		.filter(
			(filePath) =>
				filePath.endsWith('.d.ts') ||
				filePath.endsWith('.ts') ||
				filePath.endsWith('.tsx')
		)
		.join('\n');

	if (!changedFiles.length) {
		log(
			`There are no modified typescript files on the current branch compared to working branch (${upstream})`
		);
	}

	return changedFiles;
}

async function types(...args) {
	const force = args.includes('--force');

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
	let notChecked = 0;
	let skipped = 0;

	log(`Generating types for ${projects.length} projects:`);

	const filesDiff = force ? [] : tsDiffFromWorkingBranch();

	for (let i = 0; i < projects.length; i++) {
		const {dependencies, directory, name} = projects[i];

		try {
			process.chdir(directory);

			const config = getMergedConfig('npmscripts');

			const {build: BUILD_CONFIG} = config;

			if (BUILD_CONFIG.tsc !== false) {
				const dependencyNames = Object.keys(dependencies);

				const dependencyDirname = projects
					.filter((project) => dependencyNames.includes(project.name))
					.map((project) => path.basename(project.directory));

				const moduleChanges = filesDiff.includes(
					path.basename(directory)
				);

				const dependencyChanges = dependencyDirname.find(
					(dependencyDirectoryName) =>
						filesDiff.includes(dependencyDirectoryName)
				);

				if (force || moduleChanges || dependencyChanges) {
					const description = moduleChanges
						? `(changes detected)`
						: dependencyChanges
						? `(changes to a dependency)`
						: '';

					log(`> ${upToDateCount + 1}. '${name}' ${description}`);

					if (await runTSC()) {
						upToDateCount++;
					}
				}
				else {
					notChecked++;
				}
			}
			else {
				skipped++;
			}
		}
		finally {
			process.chdir(cwd);
		}
	}

	const staleCount = projects.length - upToDateCount - skipped - notChecked;

	if (filesDiff.length) {
		if (skipped > 0) {
			log(
				`> Skipped types for ${skipped} modules. (config.build.tsc=false)`
			);
		}

		if (notChecked > 0) {
			log(
				`> No changes were detected for ${notChecked} other modules or their dependencies.`
			);
		}
	}

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
