/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {ncp} from 'ncp';

/**
 *
 */
export default function() {
	fs.mkdirpSync('build');

	ncp('src', 'build', function(err) {
		if (err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log('JavaScript files copied.');
		}
	});
}
