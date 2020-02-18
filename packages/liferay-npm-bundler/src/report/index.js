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
		this._rootPkg = undefined;
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
		return this._warnings.length > 0;
	}

	/**
	 * Register a warning.
	 * @param  {String} message the warning message
	 * @param  {boolean} unique set to true if you want this warning to be deduped
	 * @return {void}
	 */
	warn(message, {unique} = {unique: false}) {
		if (unique && this._warnings.find(item => item === message)) {
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
		this._rootPkg = {
			id: rootPkg.id,
			name: rootPkg.name,
			version: rootPkg.version,
		};
	}

	rulesConfig(config) {
		this._rules.config = config;
	}

	rulesRun(prjRelPath, logger) {
		this._rules.files[prjRelPath] = {logger};
	}
}

const report = new Report();

export default report;
