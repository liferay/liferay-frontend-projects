/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const Generator = require('yeoman-generator');

const themeBased = require('../../lib/generation/theme-based');

/**
 * Generator to create a theme project extending styled, kickstarted from
 * admin.
 */
module.exports = class extends Generator {
	async writing() {
		await themeBased.writing(this, 'admin');
	}
};
