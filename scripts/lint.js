/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const LINT_GLOBS = ['**/*.js', '.*.js'];

/**
 * In order for eslint-config-liferay to be applied to itself, we need
 * to make a copy of the default config that uses a path-based reference
 * to the local config instead of a module name.
 */

function prepareConfig() {
	const rc = require('../.eslintrc');

	// Minor future-proofing: deal with array or string "extends" property.

	const extendsArray = Array.isArray(rc.extends) ? rc.extends : [rc.extends];

	rc.extends = extendsArray.map(config => {
		if (config === 'liferay') {
			return path.join(__dirname, '../index.js');
		} else {
			return config;
		}
	});

	return rc;
}

function formatConfig(config) {
	return (
		'module.exports = ' +
		JSON.stringify(config, null, 1).replace(/^ +/gm, match =>
			'\t'.repeat(match.length)
		) +
		';'
	);
}

function writeConfig(configString) {
	const configPath = path.join(__dirname, '../.eslintrc-internal.js');

	fs.writeFileSync(configPath, configString);

	return configPath;
}

function parseArgs(args) {
	// Skip first two args (the node process, and the script path).

	return args.slice(2);
}

function lint(configPath) {
	const args = parseArgs(process.argv);

	child_process.spawnSync(
		'eslint',
		['--no-eslintrc', '--config', configPath, ...args, ...LINT_GLOBS],
		{stdio: 'inherit'}
	);
}

const config = prepareConfig();
const configString = formatConfig(config);
const configPath = writeConfig(configString);

lint(configPath);
