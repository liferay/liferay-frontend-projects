/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {
	theme: devDependenciesMap,
} = require('liferay-theme-tasks/lib/devDependencies');
const path = require('path');
const Generator = require('yeoman-generator');

const {normalizeName, runGulpInit, runInstall} = require('../../lib/util');
const Copier = require('../../lib/utils/Copier');
const promptWithConfig = require('../../lib/utils/promptWithConfig');
const versions = require('../../lib/versions');

/**
 * Generator to create a theme project.
 */
module.exports = class extends Generator {
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	async prompting() {
		this.answers = await promptWithConfig(this, 'theme', [
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
				default: versions.supported[0],
				message: 'Which version of Liferay is this theme for?',
				name: 'liferayVersion',
				type: 'list',
			},
			{
				default: true,
				message: 'Would you like to add Font Awesome to your theme?',
				name: 'fontAwesome',
				type: 'confirm',
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
		runInstall(this);
	}

	end() {
		runGulpInit('theme');
	}

	_getDevDependencies() {
		const {fontAwesome, liferayVersion} = this.answers;

		const devDependencies = {...devDependenciesMap[liferayVersion].default};

		if (fontAwesome) {
			devDependencies['liferay-font-awesome'] =
				devDependenciesMap[liferayVersion].optional[
					'liferay-font-awesome'
				];
		}

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
