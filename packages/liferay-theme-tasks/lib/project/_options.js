/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

class Options {
	constructor(project, options) {
		this._project = project;

		Object.assign(this, options);
	}
}

module.exports = Options;
