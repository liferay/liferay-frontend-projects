/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const log = require('./log');
const {SpawnError} = require('./spawnSync');

/**
 * Utility function for running multiple commands in series.
 *
 * Any `SpawnError` instances that are thrown are accumulated, allowing
 * all callbacks in the series to finish running. This allows us, for
 * example, to run `prettier` and `eslint`, without errors in the former
 * preventing the latter from running.
 */
async function spawnMultiple(...callbacks) {
	let failedCount = 0;

	for (const callback of callbacks) {
		try {
			await callback();
		}
		catch (error) {
			failedCount++;

			if (error instanceof SpawnError) {
				log(error.message);
			}
			else {
				throw error;
			}
		}
	}

	if (failedCount) {
		const jobCount = callbacks.length;

		const jobs = jobCount === 1 ? 'job' : 'jobs';

		throw new SpawnError(`${failedCount} of ${jobCount} ${jobs} failed`);
	}
}

module.exports = spawnMultiple;
