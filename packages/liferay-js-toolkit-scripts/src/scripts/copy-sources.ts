/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

import cpr from 'cpr';
import fs from 'fs-extra';

/**
 *
 */
export default function (): void {
	fs.mkdirpSync('build');

	cpr('src', 'build', {confirm: true, overwrite: true}, (err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		} else {
			console.log('JavaScript files copied.');
		}
	});
}
