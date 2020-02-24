/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const chalk = require('chalk');
const gutil = require('gulp-util');
const path = require('path');
const {StringDecoder} = require('string_decoder');
const through = require('through2');

const liferayR2 = require('./liferay-r2');

const decoder = new StringDecoder('utf8');
const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-R2-css';

function gulpR2() {
	const task = through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

		if (file.isBuffer()) {
			try {
				file.contents = swapBuffer(
					file.contents,
					path.relative('.', file.path)
				);
			} catch (err) {
				this.push(file);

				// eslint-disable-next-line no-console
				console.log(
					chalk.red.bold('[ERROR]'),
					chalk.magenta(`.${path.sep}${err.filename}`),
					chalk.cyan(
						`(${err.position.end.line}:${err.position.end.column})`
					),
					chalk.red.bold(err.description)
				);

				task.hasCssParseErrors = true;
			}

			cb(null, file);
		}

		if (file.isStream()) {
			this.emit(
				'error',
				new PluginError(PLUGIN_NAME, 'Streaming not supported')
			);

			return cb();
		}
	});

	return task;
}

function swapBuffer(buffer, filename) {
	var swapped = liferayR2.swap(decoder.write(buffer), {filename});

	return new Buffer.from(swapped);
}

module.exports = gulpR2;
