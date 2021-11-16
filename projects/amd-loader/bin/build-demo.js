/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');

const {copy, run} = require('./util');

const DEMO_BUILD = path.join('build', 'demo');
const DEMO_SRC = path.join('src', 'demo');
const LOADER = path.join('build', 'loader');

if (!fs.existsSync(path.join(LOADER, 'loader-debug.js'))) {
	run('yarn', 'build');
}

copy(
	path.join(LOADER, 'loader-debug.js'),
	path.join(DEMO_BUILD, 'loader-debug.js')
);
copy(path.join(DEMO_SRC, 'index.html'), path.join(DEMO_BUILD, 'index.html'));
copy(path.join(DEMO_SRC, 'config.js'), path.join(DEMO_BUILD, 'config.js'));

fs.mkdirsSync(path.join(DEMO_BUILD, 'resolutions'));

globby.sync('src/demo/resolutions/*').forEach((filePath) => {
	const fileName = path.basename(filePath);

	copy(
		path.join(DEMO_SRC, 'resolutions', fileName),
		path.join(DEMO_BUILD, 'resolutions', fileName)
	);
});

globby.sync('src/demo/modules/**/*.js').forEach((file) => {
	const filePath = file.substring(
		path.join(DEMO_SRC, 'modules').length + path.sep.length
	);

	const dirname = path.dirname(filePath);

	fs.mkdirsSync(DEMO_BUILD, 'modules', dirname);

	copy(
		path.join(DEMO_SRC, 'modules', filePath),
		path.join(DEMO_BUILD, 'modules', filePath)
	);
});
