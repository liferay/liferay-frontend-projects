/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const findRoot = require('./findRoot');
const log = require('./log');

const HEADER = 'label,start,end,delta';

let metrics;

/**
 * Returns instrumented versions of the callback functions in the
 * `callbacks` object. Instrumented functions record timing information
 * in the directory specified by the `LIFERAY_NPM_SCRIPTS_TIMING`
 * environment variable (if set).
 *
 * Example usages:
 *
 *     # Gathering instrumented results for just one module (on macOS):
 *     cd modules/frontend-js/frontend-js-web
 *     env LIFERAY_NPM_SCRIPTS_TIMING=/tmp/frontend yarn build
 *
 *     # Or for a full build (Linux):
 *     export LIFERAY_NPM_SCRIPTS_TIMING=/dev/shm/npm-scripts
 *     ant all
 *
 *     # Producing an aggregate report:
 *     support/generateTimingsReport.js "$LIFERAY_NPM_SCRIPTS_TIMING"
 */
function instrument(callbacks) {
	if (!process.env.LIFERAY_NPM_SCRIPTS_TIMING) {
		return callbacks;
	}

	const instrumented = {};

	for (const [label, callback] of Object.entries(callbacks)) {
		if (callback[Symbol.toStringTag] === 'AsyncFunction') {
			instrumented[label] = async (...args) => {
				let result;

				const start = Date.now();

				try {
					result = await callback(...args);
				}
				finally {
					const end = Date.now();

					metrics[label] = metrics[label] || [];

					metrics[label].push({end, start});
				}

				return result;
			};
		}
		else {
			instrumented[label] = (...args) => {
				let result;

				const start = Date.now();

				try {
					result = callback(...args);
				}
				finally {
					const end = Date.now();

					metrics[label] = metrics[label] || [];

					metrics[label].push({end, start});
				}

				return result;
			};
		}
	}

	if (!metrics) {
		metrics = {};

		process.on('exit', () => {
			const dirname = process.env.LIFERAY_NPM_SCRIPTS_TIMING;

			const cwd = process.cwd();

			const root = findRoot() || cwd;

			const output =
				path.join(
					dirname,
					root === cwd
						? path.basename(root)
						: path.relative(root, process.cwd())
				) + '.csv';

			log(`Writing timing information to: ${output}`);

			fs.mkdirSync(path.dirname(output), {recursive: true});

			const events = [];

			for (const [label, timestamps] of Object.entries(metrics)) {
				for (const {end, start} of timestamps) {
					const delta = end - start;
					events.push({delta, end, label, start});
				}
			}

			events.sort((a, b) => a.start - b.start);

			const handle = fs.openSync(output, 'w');

			fs.writeSync(handle, `${HEADER}\n`, undefined, 'utf8');

			for (const {delta, end, label, start} of events) {
				fs.writeSync(handle, `${label},${start},${end},${delta}\n`);
			}
		});
	}

	return instrumented;
}

instrument.HEADER = HEADER;

module.exports = instrument;
