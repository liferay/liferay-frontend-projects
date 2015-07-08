'use strict';

var fs = require('fs-extra');
var gutil = require('gulp-util');
var path = require('path');
var PluginError = gutil.PluginError;
var through = require('through2');

var PLUGIN_NAME = 'gulp-blacklister';

function blackList(fileContents, regexp, list) {
	var match = regexp.exec(fileContents);
	if (match && list.indexOf(match[1]) < 0) {
		list.push(match[1]);
	}
}

function blackListFunctions(fileContents, list) {
	var regexp = /@function\s(.*)\(/g;

	blackList(fileContents, regexp, list);
}

function blackListMixins(fileContents, list) {
	var regexp = /@mixin\s(.*)\(/g;

	blackList(fileContents, regexp, list);
}

function gulpBlackList(options, done) {
	options = options || {};

	var blackListData = {
		functions: [],
		mixins: []
	};

	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

		if (file.isBuffer()) {
			var fileContentsString = file.contents.toString('utf8');

			blackListFunctions(fileContentsString, blackListData.functions);
			blackListMixins(fileContentsString, blackListData.mixins);
		}

		cb(null, file);
	}, function(cb) {
		done(blackListData);

		cb();
	});
}

module.exports = gulpBlackList;