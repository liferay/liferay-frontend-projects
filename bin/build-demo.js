/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const {copy, run} = require('./util');

if (!fs.existsSync('build/loader/loader-debug.js')) {
	run('npm', 'run', 'build');
}

copy('build/loader/loader-debug.js', 'build/demo/loader-debug.js');
copy('src/demo/index.html', 'build/demo/index.html');
copy('src/demo/config.js', 'build/demo/config.js');

fs.mkdirsSync(`build/demo/resolutions`);
globby.sync('src/demo/resolutions/*').forEach(filePath => {
	const fileName = path.basename(filePath);

	copy(
		`src/demo/resolutions/${fileName}`,
		`build/demo/resolutions/${fileName}`
	);
});

globby.sync('src/demo/modules/**/*.js').forEach(file => {
	const filePath = file.substring('src/demo/modules/'.length);
	const dirname = path.dirname(filePath);

	fs.mkdirsSync(`build/demo/modules/${dirname}`);

	copy(
		path.join('src', 'demo', 'modules', filePath),
		path.join('build', 'demo', 'modules', filePath)
	);
});
