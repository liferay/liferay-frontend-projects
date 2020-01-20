/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {
	theme: devDependenciesMap,
} = require('liferay-theme-tasks/lib/devDependencies');
const path = require('path');
const Generator = require('yeoman-generator');

const Copier = require('../../lib/Copier');
const {normalizeName, runGulpInit} = require('../../lib/util');
const versions = require('../../lib/versions');

/**
 * Generator to create a theme project.
 */
module.exports = class extends Generator {
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	async prompting() {
		this.answers = await this.prompt([
			{
				default: 'My Liferay Theme',
				message: 'What would you like to call your theme?',
				name: 'themeName',
				type: 'input',
			},
			{
				default(answers) {
					return normalizeName(answers.themeName || '');
				},
				message: 'What id would you like to give to your theme?',
				name: 'themeId',
				type: 'input',
			},
			{
				choices: versions.supported,
				message: 'Which version of Liferay is this theme for?',
				name: 'liferayVersion',
				type: 'list',
			},
		]);

		this._setDestinationRoot();
	}

	writing() {
		const cp = new Copier(this);

		const context = {
			devDependencies: this._getDevDependencies(),
			themeDirName: path.basename(this.destinationRoot()),
		};

		cp.copyFile('.gitignore');
		cp.copyFile('gulpfile.js');
		cp.copyFile('package.json', {context});

		cp.copyDir('src');
	}

	install() {
		const skipInstall = this.options['skip-install'];

		if (!skipInstall) {
			this.installDependencies({bower: false});
		}
	}

	end() {
		runGulpInit();
	}

	_getDevDependencies() {
		const {liferayVersion} = this.answers;
		const devDependencies = devDependenciesMap[liferayVersion].default;

		return JSON.stringify(devDependencies, null, 2)
			.split(/\n\s*/)
			.join('\n\t\t')
			.replace('\t\t}', '\t}');
	}

	_setDestinationRoot() {
		let destinationRoot = this.answers.themeId;

		if (!destinationRoot.endsWith('-theme')) {
			destinationRoot += '-theme';
		}

		if (destinationRoot !== path.basename(this.destinationRoot())) {
			this.destinationRoot(path.resolve(destinationRoot));
		}
	}
};
