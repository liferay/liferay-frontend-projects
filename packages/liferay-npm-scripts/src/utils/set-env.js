/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const log = require('./log');

/**
 * Sets NODE_ENV to the supplied `env`, unless the user has already explicitly
 * provided a value.
 *
 * To override, run:
 *
 * ```
 * env NODE_ENV=development liferay-npm-scripts subcommand
 * ```
 *
 * Babel will consult NODE_ENV if BABEL_ENV is not defined, but you can
 * override Babel specifically with:
 *
 * ```
 * env BABEL_ENV=development liferay-npm-scripts subcommand
 * ```
 */
function setEnv(env) {
	if (process.env.NODE_ENV) {
		log(`Using pre-existing NODE_ENV: ${process.env.NODE_ENV}`);
	} else {
		log(`Using NODE_ENV: ${env}`);
		process.env.NODE_ENV = env;
	}
}

module.exports = setEnv;
