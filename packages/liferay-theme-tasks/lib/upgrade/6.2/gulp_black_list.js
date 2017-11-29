'use strict';

let through = require('through2');

function blackList(fileContents, regexp, list) {
	let match = regexp.exec(fileContents);

	if (match && list.indexOf(match[1]) < 0) {
		list.push(match[1]);
	}
}

function blackListFunctions(fileContents, list) {
	let regexp = /@function\s(.*)\(/g;

	blackList(fileContents, regexp, list);
}

function blackListMixins(fileContents, list) {
	let regexp = /@mixin\s(.*)\(/g;

	blackList(fileContents, regexp, list);
}

function gulpBlackList(options, done) {
	options = options || {};

	let blackListData = {
		functions: [],
		mixins: [],
	};

	return through.obj(
		function(file, enc, cb) {
			if (file.isNull()) {
				return cb(null, file);
			}

			if (file.isBuffer()) {
				let fileContentsString = file.contents.toString('utf8');

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
