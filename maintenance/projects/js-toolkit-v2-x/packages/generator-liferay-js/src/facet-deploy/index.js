/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig, validateLiferayDir} from '../utils';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';

/**
 * Generator to add deploy support to projects.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		const answers = await promptWithConfig(this, 'facet-deploy', [
			{
				type: 'confirm',
				name: 'liferayPresent',
				message:
					'Do you have a local installation of Liferay for development?',
				default: true,
			},
		]);

		if (!answers.liferayPresent) {
			this.answers = {};

			return;
		}

		this.answers = await promptWithConfig(this, 'facet-deploy', [
			{
				type: 'input',
				name: 'liferayDir',
				message: 'Where is your local installation of Liferay placed?',
				default: '/liferay',
				validate: validateLiferayDir,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.liferayDir) {
			return;
		}

		const npmbuildrc = new NpmbuildrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);

		npmbuildrc.setLiferayDir(this.answers.liferayDir);
		pkgJson.addScript('deploy', 'npm run build && lnbs-deploy');
	}
}

module.exports = exports['default'];
