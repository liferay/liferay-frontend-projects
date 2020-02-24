#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const log = require('../src/utils/log');
const {SpawnError} = require('../src/utils/spawnSync');

async function main() {
	await require('../src/index')();
}

main().catch(error => {
	if (error instanceof SpawnError) {
		// For this common error case (spawned tools exiting with an error)
		// we avoid printing a stack trace.
		log(error.message);
	} else {
		log(error);
	}

	process.exit(1);
});
