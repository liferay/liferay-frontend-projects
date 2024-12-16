/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	error,
	info,
	print,
	warn,
} from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';
import {ProjectType} from 'liferay-npm-build-tools-common/lib/project/probe';
import path from 'path';
import resolve from 'resolve';
import semver from 'semver';

import {Renderer, runNodeModulesBin, runPkgJsonScript} from '../../util';

const msg = {
	unsupportedProjectType: [
		error`
		Oops! Your project type is not supported by {Liferay JS Toolkit} or 
		cannot be autodetected.
		`,
		info`
		Please visit https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/docs 
		for the full list of supported project types and how they are detected.
		`,
	],
};

const scrLiferayDir = project.dir.join('src.liferay');

export default function () {
	switch (project.probe.type) {
		case ProjectType.ANGULAR_CLI:
			buildWith('build', ['--prod=true']);
			break;

		case ProjectType.CREATE_REACT_APP:
			checkReactScriptsVersion(project.dir);
			buildWith('build');
			break;

		case ProjectType.VUE_CLI:
			checkVueCliServiceVersion(project.dir);
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

		renderer.render('adapt-rt.js', {
			project,
		});

		const splitFile = fs
			.readdirSync(project.dir.join('build', 'static', 'js').asNative)
			.filter((fileName) => fileName.endsWith('.chunk.js'))[0];

		const splitId = splitFile.split('.')[0];

		renderer.render('index.js', {
			project,
			splitId,
		});

		runNodeModulesBin('liferay-npm-bundler');
	}
	finally {
		fs.removeSync(scrLiferayDir.asNative);
	}
}

function checkReactScriptsVersion(projectDir) {
	const pkgJsonPath = resolve.sync('react-scripts/package.json', {
		basedir: projectDir.asNative,
	});
	const pkgJson = require(pkgJsonPath);
	const version = pkgJson.version;

	if (!semver.satisfies(version, '^5.0.0')) {
		print(
			'',
			warn`
The adaptation process is currently designed to be used with {react-scripts}
version {5.x} series but your project is using version {${version}}. Be aware that
this may make adaptation fail.
`
		);
	}
}

function checkVueCliServiceVersion(projectDir) {
	const pkgJsonPath = resolve.sync('@vue/cli-service/package.json', {
		basedir: projectDir.asNative,
	});
	const pkgJson = require(pkgJsonPath);
	const version = pkgJson.version;

	if (!semver.satisfies(version, '^4.0.0')) {
		print(
			'',
			warn`
The adaptation process is currently designed to be used with {@vue/cli-service}
version {4.x} series but your project is using version {${version}}. Be aware that
this may make adaptation fail.
`
		);
	}
}
