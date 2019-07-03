/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const log = require('./log');

/**
 * Attempt to locate the "modules/" root directory in the liferay-portal repo by
 * walking up the tree looking for a yarn.lock.
 */
function findRoot() {
	let directory = process.cwd();

	while (directory) {
		if (fs.existsSync(path.join(directory, 'yarn.lock'))) {
			if (path.basename(directory) === 'modules') {
				return directory;
			} else {
				log(
					`Found a yarn.lock in ${directory}, but it is not the "modules/" root`
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
