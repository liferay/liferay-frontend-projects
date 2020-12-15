#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const expandGlobs = require('../src/utils/expandGlobs');
const {HEADER} = require('../src/utils/instrument');
const log = require('../src/utils/log');

function toSeconds(ms) {
	return (ms / 1000).toFixed(3);
}

/**
 * Prints an aggregate report based on CSV files generated when
 * LIFERAY_NPM_SCRIPTS_TIMING environment variable is in effect.
 *
 * Example usage:
 *
 *      support/generateTimingsReport.js "$LIFERAY_NPM_SCRIPTS_TIMING"
 */
function main() {
	if (process.argv.length !== 3) {
		throw new Error(
			'Expected 1 argument (usually "$LIFERAY_NPM_SCRIPTS_TIMING")'
		);
	}

	const base = process.argv[2];

	process.stderr.write(`Changing to: ${base}\n`);

	process.chdir(base);

	const files = expandGlobs(['*.csv']);

	const labels = {};
	const modules = {};
	const fieldCount = HEADER.split(',').length;

	for (const file of files) {
		const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);

		if (lines[0] !== HEADER) {
			throw new Error(`Missing header (${HEADER}) in ${file}`);
		}

		for (let i = 1; i < lines.length; i++) {
			const fields = lines[i].split(',');

			if (fields.length !== fieldCount) {
				throw new Error(
					`Bad field count (${fields.length}) on line ${
						i + 1
					} of ${file}`
				);
			}

			const label = fields[0];
			const delta = fields[3];

			const ms = parseInt(delta, 10);

			labels[label] = (labels[label] || 0) + ms;

			modules[file] = modules[file] || {
				'~total': 0,
			};

			modules[file]['~total'] += ms;

			modules[file][label] = (modules[file][label] || 0) + ms;
		}
	}

	// Print global statistics.

	const fields = Object.keys(labels);

	log(`module,${fields.join()}`);

	for (const [label, value] of Object.entries(labels)) {
		log(
			`global:${label},${fields
				.map((field) => (field === label ? toSeconds(value) : '0.000'))
				.join(',')}`
		);
	}

	// Print per-module statistics sorted by weight.

	const sorted = Object.entries(modules).sort(
		([, a], [, b]) => a['~total'] - b['~total']
	);

	for (const [file, data] of sorted) {
		log(
			`module:${file},${fields
				.map((field) => {
					if (typeof data[field] === 'number') {
						return toSeconds(data[field]);
					}
					else {
						return '0.000';
					}
				})
				.join(',')}`
		);
	}
}

main();
