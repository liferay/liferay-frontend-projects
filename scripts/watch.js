/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const globby = require('globby');

const {runNodeBin} = require('./util/run');

runNodeBin.pipe(
	'tsc',
	'--build',
	...globby.sync('packages/*/tsconfig.json'),
	'--watch'
);

// TODO: watch changes to static files to launch `yarn copyfiles`
