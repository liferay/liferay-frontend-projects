/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {htmlDump} from './html';
import {VersionInfo} from 'liferay-npm-build-tools-common/lib/project/types';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

/**
 * A Report holds data describing a execution of the liferay-npm-bundler so that
 * it can be dump as an HTML report.
 */
export class Report {
	_executionDate: Date;
	_executionTime: number[];
	_versionsInfo: {
		[key: string]: VersionInfo;
	};
	_rootPkg: {
		id: string;
		name: string;
		version: string;
	};
	_rules: {
		config: object;
		files: {
			[prjRelPath: string]: {
				logger: PluginLogger;
			};
		};
	};
	_warnings: string[];

	constructor() {
		this._executionDate = new Date();
		this._executionTime = undefined;
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
	 */
	toHtml(): string {
		return htmlDump(this);
	}

	/**
	 * Register execution time.
	 *
	 * @param  {Array} hrtime the time it took to execute
	 * @return {void}
	 */
	executionTime(hrtime: number[]): void {
		this._executionTime = hrtime;
	}

	/**
	 * Test if there are global warning messages present.
	 *
	 * @return true if warnings exist
	 */
	get warningsPresent(): boolean {
		return this._warnings.length > 0;
	}

	/**
	 * Register a warning.
	 *
	 * @param  message the warning message
	 * @param  unique set to true if you want this warning to be deduped
	 */
	warn(message: string, {unique}: {unique: boolean} = {unique: false}): void {
		if (unique && this._warnings.find(item => item === message)) {
			return;
		}

		this._warnings.push(message);
	}

	/**
	 * Register a versions hash describing the packages and versions used by the
	 * build process.
	 *
	 * @param  {Object} info a hash or (package,version) pairs
	 * @return {void}
	 */
	versionsInfo(info: Map<string, VersionInfo>): void {
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
	rootPackage(rootPkg: PkgDesc): void {
		this._rootPkg = {
			id: rootPkg.id,
			name: rootPkg.name,
			version: rootPkg.version,
		};
	}

	rulesConfig(config: object): void {
		this._rules.config = config;
	}

	rulesRun(prjRelPath: string, logger: PluginLogger) {
		this._rules.files[prjRelPath] = {logger};
	}
}

const report = new Report();

export default report;
