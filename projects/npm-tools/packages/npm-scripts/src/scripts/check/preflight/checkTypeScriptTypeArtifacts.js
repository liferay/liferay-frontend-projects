/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getTypeScriptDependencyGraph = require('../../../typescript/getTypeScriptDependencyGraph');
const getLiferayWorkingBranch = require('../../../utils/getLiferayWorkingBranch');
const git = require('../../../utils/git');
const types = require('../../types');

/**
 * Delegates to the "types" subcommand to confirm that all TypeScript build
 * artifacts are up-to-date, but only when changes exist on the current branch
 * that could warrant such a check, and only in the context of CI (ie. when
 * LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME is set).
 */
async function checkTypeScriptTypeArtifacts() {
	const upstream = getLiferayWorkingBranch();

	const errors = [];

	if (upstream) {
		const graph = getTypeScriptDependencyGraph();

		const directories = Object.values(graph).map(
			({directory}) => directory
		);

		if (directories) {
			const mergeBase = git('merge-base', 'HEAD', upstream);

			try {
				git('diff', mergeBase, '--quiet', '--', ...directories);
			}
			catch (error) {
				if (error.toString().includes('exited with status 1.')) {

					// Changes were detected in the directories we care about.

					try {
						await types();
					}
					catch (error) {
						errors.push(
							`checkTypeScriptTypeArtifacts() failed: ${error}`
						);
					}
				}
				else {
					throw error;
				}
			}
		}
	}

	return errors;
}

module.exports = checkTypeScriptTypeArtifacts;
