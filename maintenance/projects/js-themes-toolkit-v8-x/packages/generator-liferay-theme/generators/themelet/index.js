/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const path = require('path');

const Base = require('../app');

module.exports = class extends Base {
	initializing() {
		super.initializing();
	}

	prompting() {
		super.prompting();
	}

	_setThemeDirName() {
		let themeDirName = this.appname;

		if (!/-themelet$/.test(themeDirName)) {
			themeDirName += '-themelet';
		}

		this.themeDirName = themeDirName;
	}

	configuring() {
		this._setThemeDirName();
		this._enforceFolderName();
	}

	_writeApp() {
		this.fs.copyTpl(
			this.templatePath('_package.json'),
			this.destinationPath('package.json'),
			this
		);

		this.sourceRoot(path.join(this._sourceRoot, '../../app/templates'));

		this.fs.copy(
			this.templatePath('gitignore'),
			this.destinationPath('.gitignore')
		);
	}

	_writeProjectFiles() {
		this.sourceRoot(
			path.join(this._sourceRoot, '../../themelet/templates')
		);

		this.fs.copy(
			this.templatePath('src/css/custom.css'),
			this.destinationPath('src/css/_custom.scss')
		);
	}

	writing() {
		this._writeApp();
		this._writeProjectFiles();
	}

	install() {

		// No-op.

	}

	_getPromptNamespace() {
		return 'themelet';
	}

	_getPrompts() {
		const instance = this;

		const prompts = super._getPrompts.call(instance);

		return prompts.reduce((result, item) => {
			const name = item.name;

			if (name === 'themeName') {
				item.default = 'My Liferay Themelet';
				item.message = 'What would you like to call your themelet?';
			}
			else if (name === 'themeId') {
				item.message = 'Would you like to use this as the themeletId?';
			}
			else if (name === 'liferayVersion') {
				item.choices = ['7.1', '7.0', 'All'];
				item.message = 'Which version of Liferay is this themelet for?';
			}

			if (name !== 'supportCompass' && name !== 'templateLanguage') {
				result.push(item);
			}

			return result;
		}, []);
	}

	_isLiferayVersion(value) {
		return ['7.1', '7.0', 'All'].indexOf(value) > -1;
	}

	_promptCallback(props) {
		if (props.liferayVersion === 'All') {
			props.liferayVersion = '*';
		}
		super._promptCallback.call(this, props);
	}

	_track() {
		this._insight.track('themelet', this.liferayVersion);
	}
};
