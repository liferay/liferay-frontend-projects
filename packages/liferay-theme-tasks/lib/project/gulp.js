/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const runSequence = require('gulp4-run-sequence');
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

		this._gulp.runSequence = runSequence.use(this._gulp);
	}

	get gulp() {
		return this._gulp;
	}
}

module.exports = Gulp;
