/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {
	theme: devDependenciesMap,
} = require('liferay-theme-tasks/lib/devDependencies');
const path = require('path');
const {argv} = require('yargs');
const Generator = require('yeoman-generator');

const Copier = require('../../lib/Copier');
const Project = require('../../lib/Project');

// If --which parameter is given show path to generator and exit
if (argv.which) {
	// eslint-disable-next-line no-console
	console.log(require.resolve('./index'));
	process.exit(0);
}

/**
 * Generator to create a theme project.
 */
module.exports = class extends Generator {
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
		this._project = new Project(this);
	}

	async prompting() {
		this.answers = await this.prompt([
			{
				message: 'Would you like to add Font Awesome to your theme?',
				name: 'fontAwesome',
				type: 'confirm',
			},
		]);
	}

	async writing() {
		const cp = new Copier(this);

		cp.copyDir('src');

		if (!this.answers.fontAwesome) {
			return;
		}

		const {_project} = this;
		const {liferayVersion} = _project;
		const devDependencies = devDependenciesMap[liferayVersion];
		const fontAwesomeVersion =
			devDependencies.optional['liferay-font-awesome'];

		_project.addDevDependency('liferay-font-awesome', fontAwesomeVersion);

		_project.modifyFile('src/css/custom.css', content =>
			content.replace(
				'/* inject:imports */',
				`/* inject:imports */
@import 'liferay-font-awesome/scss/font-awesome';
@import 'liferay-font-awesome/scss/glyphicons';`
			)
		);
	}
};
