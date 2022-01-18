/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer, format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import * as project from 'liferay-npm-build-tools-common/lib/project';

import runNodeModulesBin from './util/runNodeModulesBin';
import runPkgJsonScript from './util/runPkgJsonScript';

const {fail, info, print} = format;
const {ANGULAR_CLI, CREATE_REACT_APP, VUE_CLI} = project.ProjectType;

interface TemplateVarsProvider {
	(): object;
}

const templatesDir = new FilePath(__dirname).join('templates');

export default async function build(): Promise<void> {
	switch (project.default.probe.type) {
		case ANGULAR_CLI:
			await buildWith('build');
			break;

		case CREATE_REACT_APP:
			await buildWith('build', [], createReactAppTemplateVarsProvider);
			break;

		case VUE_CLI:
			await buildWith('build', ['--prod=true']);
			break;

		default:
			failWithUnsupportedProjectType();
	}
}

async function buildWith(
	script: string,
	args: string[] = [],
	templateVarsProvider: TemplateVarsProvider = (): object => ({})
): Promise<void> {
	runPkgJsonScript(project.default, script, args);

	const renderer = new TemplateRenderer(
		templatesDir.join(project.default.probe.type),
		new FilePath(project.default.jar.outputDir.asNative).join('generated')
	);

	const providedTemplateVars = templateVarsProvider();

	await renderer.render('adapt-rt.js', {
		project: project.default,
		...providedTemplateVars,
	});
	await renderer.render('index.js', {
		project: project.default,
		...providedTemplateVars,
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

function createReactAppTemplateVarsProvider(): object {
	const splitFile = fs
		.readdirSync(project.default.dir.join('build', 'static', 'js').asNative)
		.filter((fileName) => fileName.endsWith('.chunk.js'))[0];

	return {
		splitId: splitFile.split('.')[0],
	};
}
