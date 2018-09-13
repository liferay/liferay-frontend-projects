import path from 'path';
import Generator from 'yeoman-generator';

import {Copier} from '../utils';
import PkgJsonModifier from '../utils/modifier/package.json';

/**
 * Generator to add start support to projects.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = {};
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);
		const pkgJson = new PkgJsonModifier(this);

		pkgJson.addDevDependency('copy-webpack-plugin', '^4.0.0');
		pkgJson.addDevDependency('webpack', '^4.0.0');
		pkgJson.addDevDependency('webpack-cli', '^3.0.0');
		pkgJson.addDevDependency('webpack-dev-server', '^3.0.0');
		pkgJson.addScript('start', 'node ./scripts/start');
		cp.copyFile('scripts/start.js');

		const context = {
			pkgName: pkgJson.json.name,
			pkgVersion: pkgJson.json.version,
			cssPath: this._getCssPath(pkgJson.json),
		};

		cp.copyDir('scripts/start', {context});
	}

	/**
	 * Get the portlet's CSS path from package.json
	 * @param  {Object} pkgJson
	 * @return {string}
	 */
	_getCssPath(pkgJson) {
		if (
			!pkgJson['portlet'] ||
			!pkgJson['portlet']['com.liferay.portlet.header-portlet-css']
		) {
			return undefined;
		}

		let path = pkgJson['portlet']['com.liferay.portlet.header-portlet-css'];

		if (path.charAt(0) !== '/') {
			path = `/${path}`;
		}

		return path;
	}
}
