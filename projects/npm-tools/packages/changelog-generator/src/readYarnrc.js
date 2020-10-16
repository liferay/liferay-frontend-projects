/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const git = require('./git');

const readFileAsync = promisify(fs.readFile);

const COMMENT_REGEXP = /^\s*#/;

/**
 * Reads any .yarnrc files between the repo root and in the current working
 * directory, and returns a map representing their contents.
 *
 * Comments are ignored.
 *
 * Because local settings should override ones higher up in the hierarchy,
 * duplicate settings are resolved by keeping only the last-seen instance of any
 * given setting.
 */
async function readYarnrc() {
	try {
		fs.accessSync('package.json', fs.constants.R_OK);
	}
	catch (_error) {
		throw new Error(
			'Expected to run from a directory with a "package.json"'
		);
	}

	const settings = new Map();

	let candidate = process.cwd();

	const root = (await git('rev-parse', '--show-toplevel')).trim();

	// Will visit from most general to most local.

	while (true) {
		try {
			const contents = await readFileAsync(
				path.join(candidate, '.yarnrc'),
				'utf8'
			);

			contents.split(/\r\n|\r|\n/).forEach((line) => {
				if (COMMENT_REGEXP.test(line)) {
					return;
				}
				else {
					const match = line.match(/^\s*(\S+)\s+(.+)\s*$/);

					if (match) {
						settings.set(match[1], match[2]);
					}
				}
			});
		}
		catch (_error) {

			// No readable .yarnrc.

		}

		if (candidate === root) {
			break;
		}

		const components = candidate.split(path.sep);

		components.pop();

		candidate = components.join(path.sep);
	}

	return settings;
}

module.exports = readYarnrc;
