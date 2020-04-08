/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const {
	layout: devDependenciesMap,
} = require('liferay-theme-tasks/lib/devDependencies');
const path = require('path');
const Generator = require('yeoman-generator');

const {prompting, runLayoutCreator} = require('../../lib/generation/layout');
const {runGulpInit, runInstall, snakeCase} = require('../../lib/util');
const Copier = require('../../lib/utils/Copier');

module.exports = class extends Generator {
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	async prompting() {
		this.answers = await prompting(this);

		this._setDestinationRoot();
	}

	async writing() {
		const cp = new Copier(this);

		const {layoutId, liferayVersion} = this.answers;
		const layoutName = snakeCase(layoutId);
		const templateFilename = `${layoutName}.ftl`;
		const thumbnailFilename = `${layoutName}.png`;

		const context = {
			devDependencies: this._getDevDependencies(),
			layoutDirName: path.basename(this.destinationRoot()),
			templateDestination: '',
			templateFilename,
			thumbnailFilename,
		};

		cp.copyFile('.gitignore');
		cp.copyFile('gulpfile.js');
		cp.copyFile('package.json', {context});
		cp.copyFile('docroot/layout.png', {
			context,
			dest: `docroot/${thumbnailFilename}`,
			rawCopy: true,
		});

		cp.copyDir('docroot/WEB-INF', {context});

		const templateContent = await runLayoutCreator(
			layoutId,
			liferayVersion
		);

		this.fs.write(`docroot/${templateFilename}`, templateContent);
	}

	install() {
		runInstall(this);
	}

	end() {
		runGulpInit('plugin');
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
		let destinationRoot = this.answers.layoutId;

		if (!destinationRoot.endsWith('-layouttpl')) {
			destinationRoot += '-layouttpl';
		}

		if (destinationRoot !== path.basename(this.destinationRoot())) {
			this.destinationRoot(path.resolve(destinationRoot));
		}
	}
};
