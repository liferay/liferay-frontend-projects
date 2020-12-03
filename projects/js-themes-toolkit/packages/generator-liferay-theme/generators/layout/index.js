/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Generator = require('yeoman-generator');

const {sayHello} = require('../../lib/util');
const Project = require('../../lib/utils/Project');

/**
 * Generator to create a layout project.
 */
module.exports = class extends Generator {
	initializing() {
		sayHello(this);

		const project = new Project(this);

		if (project.type === Project.THEME) {
			this.composeWith(require.resolve('./theme-layout'));
		}
		else {
			this.composeWith(require.resolve('./standalone-layout'));
		}
	}
};
