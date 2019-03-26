/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const util = require('util');

const Base = require('../app');

module.exports = class extends Base {
	initializing() {
		super.initializing();
	}

	prompting() {
		super.prompting();
	}

	configuring() {
		// Must resolve theme files path before calling super (which chdirs).
		this.themeFiles = path.resolve(this.importTheme);

		super.configuring();
	}

	_writeThemeFiles() {
		this.sourceRoot(this.themeFiles);

		this.fs.copy(
			this.templatePath('docroot/_diffs'),
			this.destinationPath('src')
		);
		this.fs.copy(
			this.templatePath('docroot/WEB-INF'),
			this.destinationPath('src/WEB-INF')
		);
	}

	writing() {
		// Copy files from ../templates:
		this._writeApp();

		// Copy files from imported theme:
		this._writeThemeFiles();
	}

	install() {
		super.install();
	}

	_getPrompts() {
		const instance = this;

		return [
			{
				default: path.join(process.cwd(), 'mytheme-theme'),
				message: 'What theme would you like to import?',
				name: 'importTheme',
				type: 'input',
				validate: instance._validatePath,
				when: instance._getWhenFn('importTheme', 'path'),
			},
		];
	}

	_getSettingFromConfigFile(config) {
		let defaultValue = config.defaultValue;

		const filePath = path.join(this.importTheme, config.filePath);

		let match;

		try {
			const fileContents = fs.readFileSync(filePath, {
				encoding: 'utf8',
			});

			match = fileContents.match(config.regex);

			if (match) {
				defaultValue = match[1];
			}
		} catch (e) {
			this.log(chalk.yellow('   Warning ') + '%s not found', filePath);
		}

		if (!match) {
			this.log(
				chalk.yellow('   Warning ') +
					'could not determine the property %s from ' +
					chalk.yellow('%s') +
					'. Using ' +
					chalk.yellow('%s') +
					' as default value.',
				config.propertyNameInFile,
				filePath,
				config.defaultValue
			);
		}

		this[config.propertyName] = defaultValue;
	}

	_promptCallback(props) {
		this.appname = path.basename(props.importTheme);
		this.importTheme = props.importTheme;

		this._getSettingFromConfigFile({
			defaultValue: '6.2',
			filePath: 'docroot/WEB-INF/liferay-plugin-package.properties',
			propertyName: 'liferayVersion',
			propertyNameInFile: 'liferay-versions',
			regex: /liferay-versions=([0-9]\.[0-9])/,
		});

		const liferayVersion = this.liferayVersion;

		if (liferayVersion !== '6.2') {
			throw new Error(
				'Only themes for 6.2 version of Liferay can be imported'
			);
		}

		this._setPackageVersion(liferayVersion);

		this._getSettingFromConfigFile({
			defaultValue: 'vm',
			filePath: 'docroot/WEB-INF/liferay-look-and-feel.xml',
			propertyName: 'templateLanguage',
			propertyNameInFile: '<template-extension>',
			regex: /<template-extension>(.*)<\/template-extension>/,
		});
	}

	_setArgv() {
		this.argv = minimist(process.argv.slice(2), {
			alias: {
				compass: 'c',
				path: 'p',
			},
			default: {
				compass: null,
			},
			boolean: ['compass'],
		});
	}

	_validatePath(filePath) {
		let retVal = false;

		if (filePath) {
			retVal = true;

			if (!fs.existsSync(filePath)) {
				retVal = '"%s" does not exist';
			} else if (!fs.statSync(filePath).isDirectory()) {
				retVal = '"%s" is not a directory';
			} else {
				const propsFile = path.join(
					filePath,
					'docroot',
					'WEB-INF',
					'liferay-plugin-package.properties'
				);

				if (
					!fs.existsSync(propsFile) ||
					!fs.statSync(propsFile).isFile()
				) {
					retVal = '"%s" doesn\'t appear to be a theme in the SDK';
				}
			}
		}

		if (_.isString(retVal)) {
			retVal = util.format(retVal, filePath);
		}

		return retVal;
	}

	_track() {
		const insight = this._insight;

		const liferayVersion = this.liferayVersion;

		insight.track('import', liferayVersion);
	}
};
