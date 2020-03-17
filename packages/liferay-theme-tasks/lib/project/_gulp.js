/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const runSequence = require('gulp4-run-sequence');
const resolve = require('resolve');

class Gulp {
	constructor(project) {
		this._project = project;
		this._gulp = undefined;
		this._proxy = new Proxy(
			{},
			{
				get: (...args) => this._get(...args),
			}
		);
		this._runSequence = runSequence.use(this._proxy);
	}

	get proxy() {
		return this._proxy;
	}

	_init(gulp) {
		if (this._gulp !== undefined) {
			throw new Error('Gulp can be initialized just once');
		}

		this._ensureGulp(gulp);
	}

	_ensureGulp(gulp) {
		if (this._gulp !== undefined) {
			return;
		}

		if (gulp !== undefined) {
			this._gulp = gulp;
		} else {
			// eslint-disable-next-line liferay/no-dynamic-require
			this._gulp = require(resolve.sync('gulp', {
				basedir: process.cwd(),
			}));
		}
	}

	_get(target, value) {
		if (value === 'init') {
			return gulp => this._init(gulp);
		}

		this._ensureGulp();

		switch (value) {
			case 'runSequence':
				return (...args) => this._runSequence(...args);

			default:
				return this._gulp[value];
		}
	}
}

module.exports = Gulp;
