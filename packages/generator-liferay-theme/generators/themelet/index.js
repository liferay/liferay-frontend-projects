/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const Generator = require('yeoman-generator');

const {normalizeName, sayHello} = require('../../lib/util');
const Copier = require('../../lib/utils/Copier');
const promptWithConfig = require('../../lib/utils/promptWithConfig');
const versions = require('../../lib/versions');

/**
 * Generator to create a themelet project.
 */
module.exports = class extends Generator {
	initializing() {
		sayHello(this);

		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	async prompting() {
		this.answers = await promptWithConfig(this, 'themelet', [
			{
				default: 'My Liferay Themelet',
				message: 'What would you like to call your themelet?',
				name: 'themeletName',
				type: 'input',
			},
			{
				default(answers) {
					return normalizeName(answers.themeletName || '');
				},
				message: 'What id would you like to give to your themelet?',
				name: 'themeletId',
				type: 'input',
			},
			{
				choices: [...versions.supported, 'Any'],
				default: versions.supported[0],
				message: 'Which version of Liferay is this themelet for?',
				name: 'liferayVersion',
				type: 'list',
			},
		]);

		this._setDestinationRoot();
	}

	writing() {
		const cp = new Copier(this);

		const context = {
			themeletDirName: path.basename(this.destinationRoot()),
		};

		cp.copyFile('.gitignore');
		cp.copyFile('package.json', {context});

		cp.copyDir('src');
	}

	install() {
		const skipInstall = this.options['skip-install'];

		if (!skipInstall) {
			this.installDependencies({bower: false});
		}
	}

	_setDestinationRoot() {
		let destinationRoot = this.answers.themeletId;

		if (!destinationRoot.endsWith('-themelet')) {
			destinationRoot += '-themelet';
		}

		if (destinationRoot !== path.basename(this.destinationRoot())) {
			this.destinationRoot(path.resolve(destinationRoot));
		}
	}
};
