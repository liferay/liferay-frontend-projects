/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {Renderer, runNodeModulesBin, runPkgJsonScript} from '../../util';

const pkgJson = project.pkgJson;
const templatesPath = path.join(
	__dirname,
	'..',
	'..',
	'resources',
	'build',
	'angular-cli'
);
const scrLiferayDir = project.dir.join('src.liferay');

const renderer = new Renderer(templatesPath, scrLiferayDir.asNative);

export default function run() {
	runPkgJsonScript('build', ['--', '--prod=true']);

	try {
		renderer.render('index.js', {
			pkgJson,
		});
		runNodeModulesBin('liferay-npm-bundler');
	} finally {
		fs.removeSync(scrLiferayDir.asNative);
	}
}
