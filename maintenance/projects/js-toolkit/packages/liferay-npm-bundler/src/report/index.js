/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {htmlDump} from './html';

/**
 * A Report holds data describing a execution of the liferay-npm-bundler so that
 * it can be dump as an HTML report.
 * @type {Report}
 */
export class Report {

	/**
	 * Constructor
	 */
	constructor() {
		this._executionDate = new Date();
		this._versionsInfo = {};
		this._packages = {};
		this._rules = {
			config: {},
			files: {},
		};

		this._warnings = [];
	}

	/**
	 * Return an HTML string with the information contained in this report.
	 * @return {String} an HTML string
	 */
	toHtml() {
		return htmlDump(this);
	}

	/**
	 * Register execution time.
	 * @param  {Array} hrtime the time it took to execute
	 * @return {void}
	 */
	executionTime(hrtime) {
		this._executionTime = hrtime;
	}

	/**
	 * Test if there are global warning messages present.
	 * @return {boolean} true if warnings exist
	 */
	get warningsPresent() {
		return !!this._warnings.length;
	}

	/**
	 * Register a warning.
	 * @param  {String} message the warning message
	 * @param  {boolean} unique set to true if you want this warning to be deduped
	 * @return {void}
	 */
	warn(message, {unique} = {unique: false}) {
		if (unique && this._warnings.find((item) => item === message)) {
			return;
		}

		this._warnings.push(message);
	}

	/**
	 * Register a versions hash describing the packages and versions used by the
	 * build process.
	 * @param  {Object} info a hash or (package,version) pairs
	 * @return {void}
	 */
	versionsInfo(info) {
		this._versionsInfo = {};

		info.forEach((value, key) => {
			this._versionsInfo[key] = value;
		});
	}

	/**
	 * Register the root package descriptor.
	 * @param  {PkgDesc} rootPkg root package descriptor
	 * @return {void}
	 */
	rootPackage(rootPkg) {
		const pkg = this._getPackage(rootPkg.id);

		pkg.name = rootPkg.name;
		pkg.version = rootPkg.version;
	}

	/**
	 * Register the list of dependencies detected in this build.
	 * @param  {Array} deps an array of PkgDesc objects
	 * @return {void}
	 */
	dependencies(deps) {
		deps.forEach((dep) => {
			const pkg = this._getPackage(dep.id);

			pkg.name = dep.name;
			pkg.version = dep.version;
		});
	}

	/**
	 * Register a linked dependency found in the root package.json. This method
	 * must be called after registering all dependencies with the dependencies()
	 * method. Unknown dependencies will be ignored.
	 * @param  {String} packageName package name
	 * @param  {String} packageLink the link to the package
	 * @param  {String} packageVersion package version
	 * @return {void}
	 */
	linkedDependency(packageName, packageLink, packageVersion) {
		const pkgId = `${packageName}@${packageVersion}`;
		const pkg = this._getPackage(pkgId, false);

		if (pkg) {
			pkg.link = packageLink;
			pkg.version = packageVersion;
		}
	}

	/**
	 * Register a package copy action.
	 * @param  {Object} pkg a package descriptor
	 * @param  {Array} allFiles the list of all files in the package
	 * @param  {Array} copiedFiles the list of files copied to the target
	 * @return {void}
	 */
	packageCopy(pkg, allFiles, copiedFiles) {
		const rpkg = this._getPackage(pkg.id);

		Object.assign(rpkg, {
			allFiles,
			copiedFiles,
		});
	}

	/**
	 * Register a liferay-npm-bundler plugin execution.
	 * @param  {String} phase run phase (pre or post)
	 * @param  {Object} pkg package descriptor
	 * @param  {Object} plugin plugin descriptor (with config and run fields)
	 * @param  {PluginLogger} logger the logger cotaining the process messages
	 * @return {void}
	 */
	packageProcessBundlerPlugin(phase, pkg, plugin, logger) {
		const pkgProcess = this._getPackageProcess(pkg.id);

		pkgProcess[phase][plugin.name] = {
			plugin,
			logger,
		};
	}

	/**
	 * Register a Babel execution config.
	 * @param  {Object} pkg package descriptor
	 * @param  {Object} babelConfig the Babel config object
	 * @return {void}
	 */
	packageProcessBabelConfig(pkg, babelConfig) {
		const {babel} = this._getPackageProcess(pkg.id);

		babel.config = babelConfig;
	}

	/**
	 * Register a Babel file process.
	 * @param  {Object} pkg package descriptor
	 * @param  {String} filePath the file path
	 * @param  {PluginLogger} logger the logger cotaining the process messages
	 * @return {void}
	 */
	packageProcessBabelRun(pkg, filePath, logger) {
		const {babel} = this._getPackageProcess(pkg.id);

		babel.files[filePath] = {logger};
	}

	rulesConfig(config) {
		this._rules.config = config;
	}

	rulesRun(prjRelPath, logger) {
		this._rules.files[prjRelPath] = {logger};
	}

	/**
	 * Get a package slot and create it if missing.
	 * @param  {String} pkgId the package id
	 * @param  {Boolean} create whether to create the entry if it doesn't exist
	 * @return {Object} a package slot
	 */
	_getPackage(pkgId, create = true) {
		let pkg = this._packages[pkgId];

		if (!pkg && create) {
			pkg = this._packages[pkgId] = {
				id: pkgId,
			};

			this._getPackageProcess(pkgId);
		}

		return pkg;
	}

	/**
	 * Get a package process slot and create it if missing.
	 * @param  {String} pkgId the package id
	 * @return {Object} a package process slot
	 */
	_getPackageProcess(pkgId) {
		const rpkg = this._getPackage(pkgId);

		rpkg.process = rpkg.process || {
			copy: {},
			pre: {},
			babel: {
				config: {},
				files: {},
			},
			post: {},
		};

		return rpkg.process;
	}
}

const report = new Report();

export default report;
