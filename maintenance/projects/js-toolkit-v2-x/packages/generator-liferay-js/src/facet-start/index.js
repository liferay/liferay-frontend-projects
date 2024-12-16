/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import GitIgnoreModifier from '../utils/modifier/gitignore';
import PkgJsonModifier from '../utils/modifier/package.json';

/**
 * Generator to add start support to projects.
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
		this.answers = {};
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const gitignore = new GitIgnoreModifier(this);
		const pkgJson = new PkgJsonModifier(this);

		gitignore.add('.webpack/*');

		pkgJson.addDevDependency('copy-webpack-plugin', '4.6.0');
		pkgJson.addDevDependency('webpack', '4.29.6');
		pkgJson.addDevDependency('webpack-cli', '3.3.0');
		pkgJson.addDevDependency('webpack-dev-server', '3.2.1');
		pkgJson.addScript('start', 'lnbs-start');
	}
}

module.exports = exports['default'];
