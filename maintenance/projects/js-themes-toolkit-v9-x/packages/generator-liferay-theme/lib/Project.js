/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const xml2js = require('xml2js');

/**
 * A class to inspect and modify the current project files.
 */
class Project {
	constructor(generator) {
		this._generator = generator;
	}

	get type() {
		const {fs} = this._generator;
		const pkgJson = fs.readJSON('package.json');

		if (pkgJson === undefined) {
			return undefined;
		}

		const {liferayLayoutTemplate, liferayTheme} = pkgJson;

		if (liferayLayoutTemplate) {
			return Project.LAYOUT;
		}

		if (liferayTheme) {
			return Project.THEME;
		}

		return undefined;
	}

	get fontAwesome() {
		const {_liferayTheme} = this;

		return _liferayTheme.fontAwesome;
	}

	get liferayVersion() {
		const {_liferayTheme} = this;

		return _liferayTheme.version;
	}

	addDevDependency(pkgName, pkgVersion) {
		this.modifyPkgJson((pkgJson) => {
			pkgJson.devDependencies = pkgJson.devDependencies || {};
			pkgJson.devDependencies[pkgName] = pkgVersion;

			return pkgJson;
		});
	}

	modifyPkgJson(transformer) {
		const {fs} = this._generator;

		let pkgJson = fs.readJSON('package.json');

		pkgJson = transformer(pkgJson);

		fs.writeJSON('package.json', pkgJson);
	}

	modifyFile(filePath, transformer) {
		const {fs} = this._generator;

		let content = fs.read(filePath);

		content = transformer(content);

		fs.write(filePath, content);
	}

	async modifyXmlFile(filePath, transformer) {
		const {fs} = this._generator;

		let content = fs.read(filePath);

		content = await new xml2js.Parser().parseStringPromise(content);

		content = transformer(content);

		content = new xml2js.Builder().buildObject(content);

		fs.write(filePath, content);
	}

	get _liferayTheme() {
		const {fs} = this._generator;

		const {liferayTheme} = fs.readJSON('package.json');

		return liferayTheme;
	}
}

Project.THEME = 'theme';
Project.LAYOUT = 'layout';

module.exports = Project;
