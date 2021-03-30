/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getTypeScriptDependencyGraph = require('../../typescript/getTypeScriptDependencyGraph');
const getMergedConfig = require('../../utils/getMergedConfig');
const getPaths = require('../../utils/getPaths');
const git = require('../../utils/git');
const log = require('../../utils/log');
const {SpawnError} = require('../../utils/spawnSync');
const types = require('../types');

const BABEL_CONFIG_FILE_NAME = '.babelrc.js';

const ESLINT_CONFIG_FILE_NAME = '.eslintrc.js';

const PRETTIER_CONFIG_FILE_NAME = '.prettierrc.js';

const STYLELINT_CONFIG_FILE_NAME = '.stylelintrc.js';

/* eslint-disable sort-keys */

const DISALLOWED_CONFIG_FILE_NAMES = {

	// https://babeljs.io/docs/en/config-files/

	'.babelrc': BABEL_CONFIG_FILE_NAME,
	'.babelrc.cjs': BABEL_CONFIG_FILE_NAME,
	'.babelrc.json': BABEL_CONFIG_FILE_NAME,
	'.babelrc.mjs': BABEL_CONFIG_FILE_NAME,
	'babel.config.cjs': BABEL_CONFIG_FILE_NAME,
	'babel.config.js': BABEL_CONFIG_FILE_NAME,
	'babel.config.json': BABEL_CONFIG_FILE_NAME,
	'babel.config.mjs': BABEL_CONFIG_FILE_NAME,

	// https://eslint.org/docs/user-guide/configuring

	'.eslintrc': ESLINT_CONFIG_FILE_NAME,
	'.eslintrc.cjs': ESLINT_CONFIG_FILE_NAME,
	'.eslintrc.json': ESLINT_CONFIG_FILE_NAME,
	'.eslintrc.yaml': ESLINT_CONFIG_FILE_NAME,
	'.eslintrc.yml': ESLINT_CONFIG_FILE_NAME,

	// https://prettier.io/docs/en/configuration.html

	'.prettierrc': PRETTIER_CONFIG_FILE_NAME,
	'.prettierrc.json': PRETTIER_CONFIG_FILE_NAME,
	'.prettierrc.toml': PRETTIER_CONFIG_FILE_NAME,
	'.prettierrc.yaml': PRETTIER_CONFIG_FILE_NAME,
	'.prettierrc.yml': PRETTIER_CONFIG_FILE_NAME,
	'prettier.config.js': PRETTIER_CONFIG_FILE_NAME,

	// https://stylelint.io/user-guide/configuration

	'.stylelintrc': STYLELINT_CONFIG_FILE_NAME,
	'.stylelintrc.json': STYLELINT_CONFIG_FILE_NAME,
	'.stylelintrc.yml': STYLELINT_CONFIG_FILE_NAME,
	'.stylelintrc.yaml': STYLELINT_CONFIG_FILE_NAME,
	'stylelint.config.js': STYLELINT_CONFIG_FILE_NAME,
};

/* eslint-enable sort-keys */

const IGNORE_FILE = '.eslintignore';

function preflight() {
	const errors = [
		...checkConfigFileNames(),
		...checkPackageJSONFiles(),
		...checkTypeScriptTypeArtifacts(),
	];

	if (errors.length) {
		log('Preflight check failed:');

		log(...errors);

		throw new SpawnError();
	}
}

/**
 * Checks that config files use standard names.
 *
 * Returns a (possibly empty) array of error messages.
 */
function checkConfigFileNames() {
	const disallowedConfigs = getPaths(
		Object.keys(DISALLOWED_CONFIG_FILE_NAMES),
		[],
		IGNORE_FILE
	);

	return disallowedConfigs.map((file) => {
		const suggested = DISALLOWED_CONFIG_FILE_NAMES[path.basename(file)];

		return `${file}: BAD - use ${suggested} instead`;
	});
}

const BLACKLISTED_DEPENDENCY_PATTERNS = 'blacklisted-dependency-patterns';

/**
 * Runs checks against package.json files.
 *
 * Returns a (possibly empty) array of error messages.
 */
function checkPackageJSONFiles() {
	const packages = getPaths(['package.json'], [], IGNORE_FILE);

	const {rules} = getMergedConfig('npmscripts');

	const errors = [];

	if (rules && rules[BLACKLISTED_DEPENDENCY_PATTERNS]) {
		const blacklist = rules[BLACKLISTED_DEPENDENCY_PATTERNS].map(
			(pattern) => {
				return new RegExp(pattern);
			}
		);

		packages.forEach((pkg) => {
			try {
				const {dependencies} = JSON.parse(fs.readFileSync(pkg), 'utf8');

				const names = dependencies ? Object.keys(dependencies) : [];

				names.forEach((name) => {
					blacklist.forEach((pattern) => {
						if (pattern.test(name)) {
							errors.push(
								`${pkg}: BAD - contains blacklisted dependency: ${name}`
							);
						}
					});
				});
			}
			catch (error) {
				errors.push(
					`${pkg}: BAD - error thrown during checks: ${error}`
				);
			}
		});
	}

	return errors;
}

/**
 * Delegates to the "types" subcommand to confirm that all TypeScript build
 * artifacts are up-to-date, but only when changes exist on the current branch
 * that could warrant such a check, and only in the context of CI (ie. when
 * LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME is set).
 */
function checkTypeScriptTypeArtifacts() {
	const upstream = process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME;

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
						types();
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

module.exports = preflight;
