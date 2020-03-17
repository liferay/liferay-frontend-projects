/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const path = require('path');

class Store {
	constructor(project, fileName, section) {
		this._project = project;
		this._section = section;

		this._filePath = path.join(project.dir, fileName);
		this._json = {};

		try {
			this._json = fs.readJSONSync(this._filePath);
		} catch (err) {
			if (err.code !== 'ENOENT') {
				throw err;
			}
		}
	}

	set(key, value) {
		const {_filePath, _json, _section} = this;

		_json[_section][key] = value;

		fs.writeJSONSync(_filePath, _json, {spaces: 2});
	}

	store(object) {
		Object.entries(object).forEach(([key, value]) => this.set(key, value));
	}

	get(key) {
		const {_json, _section} = this;

		return _json[_section][key];
	}
}

module.exports = Store;
