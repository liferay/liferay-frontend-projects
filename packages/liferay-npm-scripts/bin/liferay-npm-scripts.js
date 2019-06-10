#!/usr/bin/env node

/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {SpawnError} = require('../src/utils/spawnSync');
const log = require('../src/utils/log');

try {
	require('../src/index')();
} catch (error) {
	if (error instanceof SpawnError) {
		// For this common error case (spawned tools exiting with an error)
		// we avoid printing a stack trace.
		log(error.message);
		process.exit(1);
	} else {
		throw error;
	}
}
