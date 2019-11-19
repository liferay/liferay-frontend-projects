/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import clone from 'clone';
import path from 'path';

import {BundlerLoaderEntryPoint, BundlerLoaderMetadata} from '../api/loaders';
import FilePath from '../file-path';
import {splitModuleName} from '../modules';
import {Project} from '.';
import {VersionInfo} from './types';

/**
 * A bundler loader plugin descriptor
 */
export interface BundlerLoaderDescriptor {
	loader: string;
	resolvedModule: string;
	exec: BundlerLoaderEntryPoint;
	options: object;
	metadata: BundlerLoaderMetadata;
}

/**
 * A normalized bundler rule (as opposed to its looser structure when found in
 * `.npmbundlerrc`).
 */
interface BundlerNormalizedRule {
	test: RegExp[];
	include: RegExp[];
	exclude: RegExp[];
	use: BundlerLoaderDescriptor[];
}

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
	constructor(project: Project) {
		this._project = project;

		const {npmbundlerrc} = project;

		this._config = npmbundlerrc['rules'] || [];

		this._rules = clone(this._config);
		this._normalizeRules();

		this._versionsInfo = undefined;
	}

	/** Get raw rules config (useful for reports) */
	get config(): object[] {
		return this._config;
	}

	/**
	 * Get all available information about versions of loaders used for the
	 * build.
	 * @return a Map where keys are package names
	 */
	get versionsInfo(): Map<string, VersionInfo> {
		if (this._versionsInfo === undefined) {
			const uses = this._rules.map(rule => rule.use);

			const descriptors = uses.reduce(
				(array, use) => array.concat(use),
				[]
			);

			const resolvedModules = descriptors.map(
				({resolvedModule}) => resolvedModule
			);

			const {_project} = this;

			this._versionsInfo = resolvedModules.reduce(
				(map: Map<string, VersionInfo>, resolvedModule) => {
					const {pkgName, modulePath} = splitModuleName(
						resolvedModule
					);
					const pkgJsonPath = _project.toolResolve(
						`${pkgName}/package.json`
					);
					const pkgJson = require(pkgJsonPath);

					map.set(resolvedModule, {
						version: pkgJson.version,
						path: path.relative(
							_project.dir.asNative,
							modulePath
								? _project.toolResolve(resolvedModule)
								: path.dirname(pkgJsonPath)
						),
					});

					return map;
				},
				new Map()
			);
		}

		return this._versionsInfo;
	}

	/**
	 * Returns the associated rules for a given absolute file path.
	 * @param prjRelPath a native file path relative to `project.dir`
	 */
	loadersForFile(prjRelPath): BundlerLoaderDescriptor[] {
		const {_rules} = this;

		const rules = _rules.filter(rule =>
			this._ruleApplies(rule, new FilePath(prjRelPath))
		);

		const loaders = rules.map(rule => rule['use']);

		// Flatten array
		return [].concat(...loaders);
	}

	_instantiateLoader(use: BundlerLoaderDescriptor): BundlerLoaderDescriptor {
		const {_project} = this;

		let moduleExports;

		try {
			use.resolvedModule = `liferay-npm-bundler-loader-${use.loader}`;
			moduleExports = _project.toolRequire(use.resolvedModule);
		} catch (err) {
			use.resolvedModule = use.loader;
			moduleExports = _project.toolRequire(use.resolvedModule);
		}

		use.exec = moduleExports['default'] || moduleExports;

		if (typeof use.exec !== 'function') {
			throw new Error(
				`Loader '${use.resolvedModule}' is incorrect: ` +
					`it does not export a function`
			);
		}

		use.metadata = moduleExports['metadata'] || {};

		if (use.metadata.encoding === undefined) {
			use.metadata.encoding = 'utf-8';
		}

		return use;
	}

	_normalizeRules(): void {
		this._rules.forEach(rule => {
			this._normalizeArrayOfRegExp(rule, 'test', '.*');
			this._normalizeArrayOfRegExp(rule, 'include', '.*');
			this._normalizeArrayOfRegExp(rule, 'exclude', '(?!)');

			if (!Array.isArray(rule['use'])) {
				rule['use'] = [rule['use']];
			}

			rule['use'] = rule['use'].map((use: any) => {
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

	_normalizeArrayOfRegExp(
		rule: object,
		fieldName: string,
		defaultValue: any
	): void {
		if (rule[fieldName] === undefined) {
			rule[fieldName] = [defaultValue];
		} else if (typeof rule[fieldName] === 'string') {
			rule[fieldName] = [rule[fieldName]];
		} else if (!Array.isArray(rule[fieldName])) {
			throw new Error(`Invalid rule ${fieldName}: ` + rule[fieldName]);
		}

		rule[fieldName] = rule[fieldName].map(test => new RegExp(test));
	}

	_ruleApplies(rule, prjRelFile: FilePath): boolean {
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

	private _config: object[];
	private readonly _project: Project;
	private _rules: BundlerNormalizedRule[];
	private _versionsInfo: Map<string, VersionInfo>;
}
