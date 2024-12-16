/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, promptWithConfig} from '../utils';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import {DEFAULT_LOCALIZATION} from './constants';

/**
 * Generator to add localization support to projects.
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
		this.answers = await promptWithConfig(this, 'facet-location', [
			{
				type: 'confirm',
				name: 'useLocalization',
				message: 'Do you want to add localization support?',
				default: true,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.useLocalization) {
			return;
		}

		const cp = new Copier(this);
		const npmbuildrc = new NpmbuildrcModifier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);

		npmbuildrc.setTranslatorTextKey('');
		npmbuildrc.setSupportedLocales([]);

		npmbundlerrc.setFeature('localization', DEFAULT_LOCALIZATION);

		cp.copyDir('features');

		pkgJson.addScript('translate', 'lnbs-translate');
	}
}

module.exports = exports['default'];
