/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const log = require('../../utils/log');
const {SpawnError} = require('../../utils/spawnSync');
const checkConfigFileNames = require('./preflight/checkConfigFileNames');
const checkPackageJSONFiles = require('./preflight/checkPackageJSONFiles');
const checkTypeScriptTypeArtifacts = require('./preflight/checkTypeScriptTypeArtifacts');
const checkYarnLock = require('./preflight/checkYarnLock');

/**
 * Runs the "preflight" checks (basically everything that is not already covered
 * by Prettier or ESLint).
 */
async function preflight() {
	const errors = [
		...checkConfigFileNames(),
		...checkPackageJSONFiles(),
		...(await checkTypeScriptTypeArtifacts()),
		...checkYarnLock(),
	];

	if (errors.length) {
		log('Preflight check failed:');

		log(...errors);

		throw new SpawnError();
	}
}

module.exports = preflight;
