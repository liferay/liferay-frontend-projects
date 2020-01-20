/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * A class to help copying Yeoman templates.
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

	get liferayVersion() {
		const {fs} = this._generator;

		const {liferayTheme} = fs.readJSON('package.json');

		return liferayTheme.version;
	}

	addDevDependency(pkgName, pkgVersion) {
		this.modifyPkgJson(pkgJson => {
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
}

Project.THEME = 'theme';
Project.LAYOUT = 'layout';

module.exports = Project;
