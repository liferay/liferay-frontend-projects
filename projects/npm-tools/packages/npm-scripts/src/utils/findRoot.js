/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

/**
 * Attempt to locate the definitive "root" directory in the
 * liferay-portal repo by walking up the tree looking for a
 * yarn.lock. In practice, the possible locations for lock files are:
 *
 *   - modules/
 *   - modules/private/
 *
 * and we keep going until we hit the former, because that is where our
 * global configuration files (like .eslintignore and .prettierignore)
 * should reside.
 *
 * @return undefined or the absolute path to the root directory
 */
function findRoot() {
	let directory = process.cwd();

	while (directory) {
		if (
			fs.existsSync(path.join(directory, 'yarn.lock')) ||
			fs.existsSync(path.join(directory, 'package-lock.json'))
		) {
			const basename = path.basename(directory);

			if (basename === 'modules') {
				return directory;
			}
		}

		if (path.dirname(directory) === directory) {

			// Can't go any higher.

			directory = null;
		}
		else {
			directory = path.dirname(directory);
		}
	}
}

module.exports = findRoot;
