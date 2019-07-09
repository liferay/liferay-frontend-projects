/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const log = require('./log');

/**
 * Attempt to locate the nearest "root" directory in the liferay-portal repo by
 * walking up the tree looking for a yarn.lock. In practice, the possible roots
 * are:
 *
 *   - modules/
 *   - modules/private/
 */
function findRoot() {
	let directory = process.cwd();

	while (directory) {
		if (fs.existsSync(path.join(directory, 'yarn.lock'))) {
			const basename = path.basename(directory);

			if (basename === 'modules' || basename === 'private') {
				return directory;
			} else {
				log(
					`Found a yarn.lock in ${directory}, but it is not in the "modules/" or "modules/private/" roots`
				);
			}
		}

		if (path.dirname(directory) === directory) {
			// Can't go any higher.
			directory = null;
		} else {
			directory = path.dirname(directory);
		}
	}
}

module.exports = findRoot;
