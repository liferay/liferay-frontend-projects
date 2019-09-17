/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import clone from 'clone';

import FilePath from '../file-path';

/**
 * Implements a restricted subset of  webpack rules specification. The rules are
 * specified as a top level field in `.npmbundlerrc`. Its supported structure
 * is:
 *
 * rules := [<rule>]
 * rule := {
 * 	 test: <test>,
 *   include: <include>,
 *   exclude: <exclude>,
 *   use: (<use> | [<use>])
 * }
 * test := (<regexp> | [<regexp>])
 * include := (<regexp> | [<regexp>])
 * exclude := (<regexp> | [<regexp>])
 * regexp := STRING
 * use := {STRING | <use_with_options>}
 * use_with_options := {
 *   loader: STRING,
 *   options: OBJECT
 * }
 *
 * See https://webpack.js.org/configuration/module/#modulerules for webpack's
 * specification.
 */
export default class Rules {
	/**
	 *
	 * @param {Project} project
	 */
	constructor(project) {
		this._project = project;

		const {_npmbundlerrc} = project;

		this._config = _npmbundlerrc.rules || [];

		this._rules = clone(this._config);
		this._normalizeRules();

		this._loaderVersionsInfo = undefined;
	}

	/**
	 * Get raw rules config (useful for reports).
	 */
	get config() {
		return this._config;
	}

	/**
	 * Get an object with information about all plugin versions
	 * @return {object}
	 */
	get loaderVersionsInfo() {
		if (this._loaderVersionsInfo === undefined) {
			let loaders = this._rules.map(rule => rule.use);

			loaders = [].concat(...loaders);

			const loaderPackages = loaders.map(loader => {
				const {resolvedModule} = loader;
				return resolvedModule.split('/')[0];
			});

			const project = this._project;

			this._loaderVersionsInfo = loaderPackages.reduce((map, pkg) => {
				const pkgJson = project.require(`${pkg}/package.json`);
				map[pkg] = pkgJson.version;
				return map;
			}, {});
		}

		return this._loaderVersionsInfo;
	}

	/**
	 * Returns the associated rules for a given absolute file path.
	 * @param {string} prjRelPath a native file path relative to
	 * 						`project.dir`
	 * @return {Array<object>} an Array of objects with structure
	 * 				`{use, resolvedModule, exec, options}`
	 */
	loadersForFile(prjRelPath) {
		const {_rules} = this;

		const rules = _rules.filter(rule =>
			this._ruleApplies(rule, new FilePath(prjRelPath))
		);

		const loaders = rules.map(rule => rule.use);

		// Flatten array
		return [].concat(...loaders);
	}

	_instantiateLoader(use) {
		const project = this._project;

		try {
			use.resolvedModule = `liferay-npm-bundler-loader-${use.loader}`;
			use.exec = project.require(use.resolvedModule);
		} catch (err) {
			use.resolvedModule = use.loader;
			use.exec = project.require(use.resolvedModule);
		}

		use.exec = use.exec.default || use.exec;

		if (typeof use.exec !== 'function') {
			throw new Error(
				`Loader '${use.resolvedModule}' is incorrect: ` +
					`it does not export a function`
			);
		}

		return use;
	}

	_normalizeRules() {
		this._rules.forEach(rule => {
			this._normalizeArrayOfRegExp(rule, 'test', '.*');
			this._normalizeArrayOfRegExp(rule, 'include', '.*');
			this._normalizeArrayOfRegExp(rule, 'exclude', '(?!)');

			if (!Array.isArray(rule.use)) {
				rule.use = [rule.use];
			}

			rule.use = rule.use.map(use => {
				if (typeof use === 'string') {
					use = {
						loader: use,
					};
				}

				if (use.options === undefined) {
					use.options = {};
				}

				use = this._instantiateLoader(use);

				return use;
			});
		});
	}

	_normalizeArrayOfRegExp(rule, fieldName, defaultValue) {
		if (rule[fieldName] === undefined) {
			rule[fieldName] = [defaultValue];
		} else if (typeof rule[fieldName] === 'string') {
			rule[fieldName] = [rule[fieldName]];
		} else if (!Array.isArray(rule[fieldName])) {
			throw new Error(`Invalid rule ${fieldName}: ` + rule[fieldName]);
		}

		rule[fieldName] = rule[fieldName].map(test => new RegExp(test));
	}

	/**
	 *
	 * @param {object} rule
	 * @param {FilePath} prjRelFile
	 */
	_ruleApplies(rule, prjRelFile) {
		const matched = rule.test.find(regexp =>
			regexp.test(prjRelFile.asPosix)
		);

		if (!matched) {
			return false;
		}

		const included = rule.include.find(regexp =>
			regexp.test(prjRelFile.asPosix)
		);

		if (!included) {
			return false;
		}

		const excluded = rule.exclude.find(regexp =>
			regexp.test(prjRelFile.asPosix)
		);

		if (excluded) {
			return false;
		}

		return true;
	}
}
