/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const path = require('path');

class Store {
	constructor(project) {
		this._project = project;
	}

	open(filePath) {
		if (this._json) {
			throw new Error('Store is already open');
		}

		this._filePath = path.resolve(filePath);
		this._json = {};

		try {
			this._json = fs.readJSONSync(filePath);
		} catch (err) {
			if (err.code !== 'ENOENT') {
				throw err;
			}
		}
	}

	set(key, value) {
		if (!this._json) {
			throw new Error('You must open the store before using it');
		}

		this._json[key] = value;

		fs.writeJSONSync(this._filePath, this._json);
	}

	store(object) {
		Object.entries(object).forEach(([key, value]) => this.set(key, value));
	}

	get(key) {
		if (!this._json) {
			throw new Error('You must open the store before using it');
		}

		return this._json[key];
	}
}

module.exports = Store;
