/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const packages = fs
	.readdirSync(path.join(__dirname, '..', 'packages'), {withFileTypes: true})
	.map((entry) => {
		if (entry.isDirectory()) {
			return path.join(
				__dirname,
				'..',
				'packages',
				entry.name,
				'tsconfig.json'
			);
		}
	})
	.filter(Boolean);

const {status} = child_process.spawnSync(
	'tsc',
	['--build', ...packages],
	{stdio: 'inherit'}
);

if (status !== 0) {
	process.exit(1);
}
