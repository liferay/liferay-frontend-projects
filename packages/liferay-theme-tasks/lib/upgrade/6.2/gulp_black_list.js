/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const through = require('through2');

function blackList(fileContents, regexp, list) {
	const match = regexp.exec(fileContents);

	if (match && list.indexOf(match[1]) < 0) {
		list.push(match[1]);
	}
}

function blackListFunctions(fileContents, list) {
	const regexp = /@function\s(.*)\(/g;

	blackList(fileContents, regexp, list);
}

function blackListMixins(fileContents, list) {
	const regexp = /@mixin\s(.*)\(/g;

	blackList(fileContents, regexp, list);
}

function gulpBlackList(options, done) {
	options = options || {};

	const blackListData = {
		functions: [],
		mixins: [],
	};

	return through.obj(
		function(file, enc, cb) {
			if (file.isNull()) {
				return cb(null, file);
			}

			if (file.isBuffer()) {
				const fileContentsString = file.contents.toString('utf8');

				blackListFunctions(fileContentsString, blackListData.functions);
				blackListMixins(fileContentsString, blackListData.mixins);
			}

			cb(null, file);
		},
		function(cb) {
			done(blackListData);

			cb();
		}
	);
}

module.exports = gulpBlackList;
