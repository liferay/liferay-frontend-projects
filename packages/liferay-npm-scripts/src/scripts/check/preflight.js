/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const getPaths = require('../../utils/getPaths');
const log = require('../../utils/log');
const {SpawnError} = require('../../utils/spawnSync');

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
	'stylelint.config.js': STYLELINT_CONFIG_FILE_NAME
};

/* eslint-enable sort-keys */

const IGNORE_FILE = '.eslintignore';

function preflight() {
	const disallowedConfigs = getPaths(
		Object.keys(DISALLOWED_CONFIG_FILE_NAMES),
		[],
		IGNORE_FILE
	);

	if (disallowedConfigs.length) {
		log('Preflight check failed:');

		disallowedConfigs.forEach(file => {
			const suggested = DISALLOWED_CONFIG_FILE_NAMES[path.basename(file)];

			log(`${file}: BAD - use ${suggested} instead`);
		});

		throw new SpawnError();
	}
}

module.exports = preflight;
