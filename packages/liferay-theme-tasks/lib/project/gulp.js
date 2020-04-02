/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const resolve = require('resolve');

class Gulp {
	constructor(project, gulp) {
		this._project = project;

		if (gulp !== undefined) {
			this._gulp = gulp;
		} else {
			// eslint-disable-next-line liferay/no-dynamic-require
			this._gulp = require(resolve.sync('gulp', {
				basedir: project.dir,
			}));
		}

		this._gulp.runSequence = (...args) => {
			let cb;

			if (typeof args[args.length - 1] === 'function') {
				cb = args.pop();
			}

			this._gulp.series(
				...args.map(task => {
					if (Array.isArray(task)) {
						return this._gulp.parallel(...task);
					} else {
						return task;
					}
				})
			)(cb);
		};
	}

	get gulp() {
		return this._gulp;
	}
}

module.exports = Gulp;
