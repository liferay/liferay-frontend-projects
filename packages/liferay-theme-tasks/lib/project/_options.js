/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

class Options {
	constructor(project) {
		this._project = project;
		this._initialized = false;
	}

	init(config) {
		if (this._initialized) {
			throw new Error('Options can be initialized just once');
		}

		this._initialized = true;

		Object.assign(this, config);
	}
}

module.exports = Options;
