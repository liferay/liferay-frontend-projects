/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const path = require('path');
const Generator = require('yeoman-generator');

const {prompting, runLayoutCreator} = require('../../lib/generation/layout');
const {snakeCase} = require('../../lib/util');
const Copier = require('../../lib/utils/Copier');

module.exports = class extends Generator {
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	async prompting() {
		this.answers = await prompting(this);
	}

	async writing() {
		const cp = new Copier(this);

		const {layoutId, liferayVersion} = this.answers;
		const layoutName = snakeCase(layoutId);
		const templateFilename = `${layoutName}.ftl`;
		const thumbnailFilename = `${layoutName}.png`;

		let layoutFolder = layoutId;

		if (!layoutFolder.endsWith('-layouttpl')) {
			layoutFolder += '-layouttpl';
		}

		const context = {
			templateDestination: `/layouttpl/custom/${layoutFolder}`,
			templateFilename,
			thumbnailFilename,
		};

		cp.copyFile('docroot/layout.png', {
			context,
			dest: `src/layouttpl/custom/${layoutFolder}/${thumbnailFilename}`,
			rawCopy: true,
		});

		cp.copyFile('docroot/WEB-INF/liferay-layout-templates.xml', {
			context,
			dest: `src/WEB-INF/liferay-layout-templates.xml`,
		});

		const templateContent = await runLayoutCreator(
			layoutId,
			liferayVersion
		);

		this.fs.write(
			`src/layouttpl/custom/${layoutFolder}/${templateFilename}`,
			templateContent
		);
	}
};
