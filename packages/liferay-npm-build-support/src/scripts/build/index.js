/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {error, info, print} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import {ProjectType} from 'liferay-npm-build-tools-common/lib/project/probe';
import path from 'path';

import {Renderer, runNodeModulesBin, runPkgJsonScript} from '../../util';
import createReactApp from './create-react-app';

const msg = {
	unsupportedProjectType: [
		error`
		Oops! Your project type is not supported by {Liferay JS Toolkit} or 
		cannot be autodetected.
		`,
		info`
		Please visit http://bit.ly/js-toolkit-wiki for the full list of 
		supported project types and how they are detected.
		`,
	],
};

const scrLiferayDir = project.dir.join('src.liferay');

export default function() {
	switch (project.probe.type) {
		case ProjectType.ANGULAR_CLI:
			buildWith('build', ['--prod=true']);
			break;

		case ProjectType.CREATE_REACT_APP:
			createReactApp();
			break;

		case ProjectType.VUE_CLI:
			buildWith('build', ['--prod=true']);
			break;

		default:
			print(msg.unsupportedProjectType);
			process.exit(1);
	}
}

/**
 * @param {string} script
 * @param {Array<*>} args
 */
function buildWith(script, args = []) {
	runPkgJsonScript(script, args);

	try {
		const templatesPath = path.join(
			__dirname,
			'..',
			'..',
			'resources',
			'build',
			project.probe.type
		);

		const renderer = new Renderer(templatesPath, scrLiferayDir.asNative);

		const {pkgJson} = project;

		renderer.render('index.js', {
			pkgJson,
		});

		runNodeModulesBin('liferay-npm-bundler');
	} finally {
		fs.removeSync(scrLiferayDir.asNative);
	}
}
