/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const runSequence = require('gulp4-run-sequence');
const resolve = require('resolve');

class Gulp {
	constructor(project, gulp) {
		this._project = project;
		this._proxy = new Proxy(
			{},
			{
				get: (...args) => this._get(...args),
			}
		);
		this._runSequence = runSequence.use(this._proxy);

		if (gulp !== undefined) {
			this._gulp = gulp;
		} else {
			// eslint-disable-next-line liferay/no-dynamic-require
			this._gulp = require(resolve.sync('gulp', {
				basedir: project.dir,
			}));
		}
	}

	get proxy() {
		return this._proxy;
	}

	_get(target, value) {
		if (value === 'init') {
			return gulp => this._init(gulp);
		}

		switch (value) {
			case 'runSequence':
				return (...args) => this._runSequence(...args);

			default:
				return this._gulp[value];
		}
	}
}

module.exports = Gulp;
