/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer, format} from '@liferay/js-toolkit-core';
import * as project from 'liferay-npm-build-tools-common/lib/project';

import runNodeModulesBin from './util/runNodeModulesBin';
import runPkgJsonScript from './util/runPkgJsonScript';

const {fail, info, print} = format;
const {ProjectType} = project;

const templatesDir = new FilePath(__dirname).join('templates');

export default async function build(): Promise<void> {
	switch (project.default.probe.type) {
		case ProjectType.ANGULAR_CLI:
			await buildWith('build');
			break;

		case ProjectType.CREATE_REACT_APP:
			await buildWith('build');
			break;

		case ProjectType.VUE_CLI:
			await buildWith('build', ['--prod=true']);
			break;

		default:
			failWithUnsupportedProjectType();
	}
}

async function buildWith(script: string, args: string[] = []): Promise<void> {
	runPkgJsonScript(project.default, script, args);

	const renderer = new TemplateRenderer(
		templatesDir.join(project.default.probe.type),
		new FilePath(project.default.jar.outputDir.asNative).join('generated')
	);

	await renderer.render('adapt-rt.js', {
		project: project.default,
	});
	await renderer.render('index.js', {
		project: project.default,
	});

	runNodeModulesBin(project.default, 'liferay-npm-bundler');
}

function failWithUnsupportedProjectType(): void {
	print(
		fail`
Oops! Your project type is not supported by {Liferay JS Toolkit} or cannot be
autodetected.`,
		'',
		info`
Please visit http://bit.ly/js-toolkit-adapt for the full list of supported
project types and how they are detected.`
	);

	process.exit(1);
}
