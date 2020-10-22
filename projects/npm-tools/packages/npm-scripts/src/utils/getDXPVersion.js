/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const findRoot = require('./findRoot');

/**
 * Attempts to infer the current DXP version based on the contents of the
 * `release.properties` file in the repo root directory.
 */
function getDXPVersion() {
	const modules = findRoot();

	if (modules) {
		const properties = path.join(
			path.dirname(modules),
			'release.properties'
		);

		try {
			const contents = fs.readFileSync(properties, 'utf8');

			const [, major, minor, patch] =
				contents.match(
					/^\s*release\.info\.version\s*=\s*(\d+)\.(\d+)\.(\d+)\s*$/m
				) || [];

			if (major !== undefined) {
				return {
					major: parseInt(major, 10),
					minor: parseInt(minor, 10),
					patch: parseInt(patch, 10),
				};
			}
		}
		catch {

			// Oh well, it was worth a shot...

		}
	}
}

module.exports = getDXPVersion;
