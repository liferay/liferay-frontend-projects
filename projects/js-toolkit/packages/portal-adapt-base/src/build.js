/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {
	FilePath,
	TemplateRenderer,
	format,
} = require('@liferay/js-toolkit-core');
const project = require('liferay-npm-build-tools-common/lib/project');

const runNodeModulesBin = require('./util/runNodeModulesBin');
const runPkgJsonScript = require('./util/runPkgJsonScript');

const {fail, info, print} = format;
const {ProjectType} = project;

const templatesDir = new FilePath(__dirname).join('templates');

module.exports = function build() {
	switch (project.default.probe.type) {
		case ProjectType.ANGULAR_CLI:
			buildWith('build');
			break;

		case ProjectType.CREATE_REACT_APP:
			buildWith('build');
			break;

		case ProjectType.VUE_CLI:
			buildWith('build', ['--prod=true']);
			break;

		default:
			failWithUnsupportedProjectType();
	}
};

/**
 * @param {string} script
 * @param {Array<*>} args
 */
async function buildWith(script, args = []) {
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

function failWithUnsupportedProjectType() {
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
