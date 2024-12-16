/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

import JsonModifier from '../JsonModifier';

/**
 * A class to help modifying the package.json file.
 */
export default class extends JsonModifier {

	/**
	 * @param {Generator} generator a Yeoman generator
	 * @param {string|number} space the space string/number of spaces to use
	 * 			when stringifying
	 */
	constructor(generator, space = '\t') {
		super(generator, 'package.json', space);
	}

	/**
	 * Set the main entry of the package.json file
	 * @param {string} module module name
	 */
	setMain(module) {
		this.modifyJson((json) => {
			prop.set(json, 'main', module);
		});
	}

	/**
	 * Add a devDependency to the pacakge.json file
	 * @param {String} name package name
	 * @param {String} semver semver constraints
	 */
	addDevDependency(name, semver) {
		name = this._escapeProp(name);

		this.modifyJson((json) => {
			prop.set(json, `devDependencies.${name}`, semver);
		});
	}

	/**
	 * Add a dependency to the pacakge.json file
	 * @param {String} name package name
	 * @param {String} semver semver constraints
	 */
	addDependency(name, semver) {
		name = this._escapeProp(name);

		this.modifyJson((json) => {
			prop.set(json, `dependencies.${name}`, semver);
		});
	}

	/**
	 * Merge all dependencies and devDependencies contained in a JSON object
	 * into the package.json file.
	 * @param {Object} dependencies an object with dependencies and
	 * 						devDependencies fields
	 */
	mergeDependencies(dependencies) {
		Object.entries(dependencies.dependencies).forEach(([name, semver]) =>
			this.addDependency(name, semver)
		);

		Object.entries(dependencies.devDependencies).forEach(([name, semver]) =>
			this.addDevDependency(name, semver)
		);
	}

	/**
	 * Prepend a build command to the build npm script of package.json
	 * @param {String} command the command to run
	 */
	addBuildStep(command) {
		this.modifyJson((json) => {
			const currentBuild = prop.get(json, 'scripts.build');

			if (currentBuild) {
				command = `${command} && ${currentBuild}`;
			}

			prop.set(json, 'scripts.build', command);
		});
	}

	/**
	 * Add a new npm script to package.json
	 * @param {String} name name of script
	 * @param {String} command command to run
	 */
	addScript(name, command) {
		name = this._escapeProp(name);

		this.modifyJson((json) => {
			prop.set(json, `scripts.${name}`, command);
		});
	}

	/**
	 * Add a property inside the portlet section.
	 * @param {string} name name of property
	 * @param {any} value value of property
	 */
	addPortletProperty(name, value) {
		name = this._escapeProp(name);

		this.modifyJson((json) => {
			prop.set(json, `portlet.${name}`, value);
		});
	}
}
