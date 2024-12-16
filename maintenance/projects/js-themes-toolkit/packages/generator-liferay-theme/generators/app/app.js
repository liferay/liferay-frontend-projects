/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');
const {argv} = require('yargs');
const Generator = require('yeoman-generator');

const Copier = require('../../lib/utils/Copier');
const Project = require('../../lib/utils/Project');

// If --which parameter is given show path to generator and exit

if (argv.which) {
	// eslint-disable-next-line no-console
	console.log(require.resolve('./index'));
	process.exit(0);
}

/**
 * Generator to create a theme project.
 */
module.exports = class extends Generator {
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
		this._project = new Project(this);
	}

	async writing() {
		const cp = new Copier(this);

		const context = {
			fontAwesome: this._project.fontAwesome,
		};

		cp.copyDir('src', {context});
	}
};
