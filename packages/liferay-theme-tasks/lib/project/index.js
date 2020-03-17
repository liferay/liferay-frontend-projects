/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const path = require('path');

const Gulp = require('./_gulp');
const Options = require('./_options');
const Store = require('./_store');
const ThemeConfig = require('./_theme-config');

class Project {
	constructor(projectDir) {
		this._dir = path.resolve(projectDir);
		this._gulp = new Gulp(this);
		this._options = new Options(this);
		this._pkgJsonPath = path.join(this.dir, 'package.json');
		this._pkgJson = fs.readJSONSync(this._pkgJsonPath);
		this._store = new Store(this);
		this._themeConfig = new ThemeConfig(this);
		this._watching = false;
	}

	get dir() {
		return this._dir;
	}

	get gulp() {
		return this._gulp.proxy;
	}

	get options() {
		return this._options;
	}

	get pkgJson() {
		return this._pkgJson;
	}

	get store() {
		return this._store;
	}

	get themeConfig() {
		return this._themeConfig;
	}

	get watching() {
		return this._watching;
	}

	modifyPkgJson(modifier) {
		this._pkgJson = modifier(this._pkgJson);

		fs.writeJSONSync(this._pkgJsonPath, this._pkgJson);
	}

	set watching(watching) {
		this._watching = watching;
	}
}

module.exports = new Project('.');
