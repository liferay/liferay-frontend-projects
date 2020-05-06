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
export default function(): void {
	fs.mkdirpSync('build');

	cpr(
		'assets',
		'build',
		{
			confirm: true,
			filter: path => !/\/\.placeholder$/.test(path),
			overwrite: true,
		},
		err => {
			if (err && err.message !== 'No files to copy') {
				console.error(err);
				process.exit(1);
			} else {
				console.log('Project assets copied.');
			}
		}
	);
}
