/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';
import {ProjectType} from 'liferay-npm-build-tools-common/lib/project/probe';

import ensureOutputFile from '../util/ensureOutputFile';
import getPortletName from '../util/getPortletName';
import prompt from '../util/prompt';
import toHumanReadable from '../util/toHumanReadable';

const {
	PkgJson: {addDependencies, addPortletProperties, addScripts},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {fail, info, print, success, text, title} = format;

export interface Options {
	category?: string;
	target: 'angular-cli' | 'create-react-app' | 'vue-cli';
}

const tuneProjectMethods = {
	[ProjectType.ANGULAR_CLI]: tuneAngularCliProject,
	[ProjectType.CREATE_REACT_APP]: tuneCreateReactAppProject,
	[ProjectType.VUE_CLI]: tuneVueCliProject,
};

export default async function adaptProject(
	batch?: boolean,
	optionsFilePath?: string
): Promise<void> {
	try {
		/* eslint-disable-next-line @typescript-eslint/no-var-requires */
		const {version} = require('../../package.json');

		print(
			'',
			title`|👋 |Welcome to Liferay Project Adapter v${version}`,
			''
		);

		const tuneProject = tuneProjectMethods[project.probe.type];

		if (!tuneProject) {
			failWithUnsupportedProjectType();
		}

		print(
			success`We have detected a project of type {${project.probe.type}}`,
			'',
			text`
It will be tuned accordingly, so that you can deploy it to your Liferay server.
But first we need you to answer some customization questions...
`
		);

		let options: Options;

		if (optionsFilePath) {
			try {
				options = {
					...options,
					...JSON.parse(fs.readFileSync(optionsFilePath, 'utf8')),
				};
			}
			catch (error) {
				throw new Error(
					`Could not read options file (${error.message})`
				);
			}
		}

		options = await promptForOptions(batch, {
			...options,
			target: project.probe.type,
		});

		print('', text`⚙ Adapting project...`);

		await performBaseAdaptation(options);
		await tuneProject(options);

		const pkgManager = project.pkgManager;
		const projectName = project.pkgJson['name'];

		print(
			'',
			success`{Project has been adapted successfully!}`,
			'',
			text`
Your project has been successfully adapted to {Liferay JS Toolkit}.

You can now run the following commands to build your project:

    $ {${pkgManager} install| ↩|} 
    $ {${pkgManager} run build:liferay| ↩|} 

This will create a {${projectName}.jar} file in your {dist} folder that you can
deploy to your local Liferay server.
`
		);
	}
	catch (error) {
		print(fail`Could not adapt project due to error:`);
		print(text`${error.stack}`);
	}
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

async function performBaseAdaptation(options: Options): Promise<void> {
	const projectDir = new FilePath('.').resolve();

	const gitIgnoreFile = ensureOutputFile(
		{outputPath: projectDir},
		'.gitignore'
	);

	await transformTextFile(
		gitIgnoreFile,
		gitIgnoreFile,
		appendLines('/build.liferay')
	);

	const pkgJsonFile = ensureOutputFile(
		{outputPath: projectDir},
		'package.json'
	);
	/* eslint-disable-next-line @liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
	const pkgJson = require(pkgJsonFile.asNative);
	const portletDisplayName = toHumanReadable(pkgJson['name']);
	const portletName = getPortletName(pkgJson['name']);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addDependencies(
			{
				[`@liferay/portal-adapt-${options.target}`]: '*',
			},
			'dev'
		),
		addPortletProperties({
			'com.liferay.portlet.display-category': options.category,
			'javax.portlet.name': portletName,
			'javax.portlet.resource-bundle': 'content.Language',
			'javax.portlet.security-role-ref': 'power-user,user',
		}),
		addScripts({
			'build:liferay': 'liferay build',
			'clean:liferay': 'liferay clean',
			'deploy:liferay': 'liferay deploy',
		})
	);

	const languagePropertiesFile = ensureOutputFile(
		{outputPath: projectDir},
		'features/localization/Language.properties'
	);

	await transformTextFile(
		languagePropertiesFile,
		languagePropertiesFile,
		appendLines(`javax.portlet.title.${portletName}=${portletDisplayName}`)
	);
}

async function promptForOptions(
	useDefaults: boolean,
	options: Options
): Promise<Options> {
	if (project.pkgManager === null) {
		const answer = await prompt(useDefaults, {}, [
			{
				choices: [
					{name: 'npm', value: 'npm'},
					{name: 'yarn', value: 'yarn'},
				],
				default: 'npm',
				message: 'Which package manager are you using for the project?',
				name: 'pkgManager',
				type: 'list',
			},
		]);

		// Set project's package manager internally using a hack

		project['_pkgManager'] = answer['pkgManager'];
	}

	options = await prompt(useDefaults, options, [
		{
			default: 'category.sample',
			message: 'Under which category should your widget be listed?',
			name: 'category',
			type: 'input',
		},
	]);

	return options;
}

async function tuneAngularCliProject(_options: Options): Promise<void> {
	const pkgJsonFile = new FilePath(project.dir.join('package.json').asNative);

	/* eslint-disable-next-line @liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
	const pkgJson = require(pkgJsonFile.asNative);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addPortletProperties({
			'com.liferay.portlet.header-portlet-css': `/${pkgJson.name}/styles.css`,
			'com.liferay.portlet.instanceable': false,
		})
	);
}

async function tuneCreateReactAppProject(_options: Options): Promise<void> {
	const pkgJsonFile = new FilePath(project.dir.join('package.json').asNative);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addPortletProperties({
			'com.liferay.portlet.instanceable': true,
		})
	);
}

async function tuneVueCliProject(_options: Options): Promise<void> {
	const pkgJsonFile = new FilePath(project.dir.join('package.json').asNative);

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addPortletProperties({
			'com.liferay.portlet.instanceable': true,
		})
	);
}
