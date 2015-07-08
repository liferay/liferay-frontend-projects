'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var gutil = require('gulp-util');
var jsDiff = require('diff');
var path = require('path');
var through = require('through2');

var coreThemeStructure = require('./core_theme_structure.json');

var PLUGIN_NAME = 'gulp-css-diff';

function getBackupFilePath(filePath) {
	var fileName = path.basename(filePath, path.extname(filePath));
	var cwd = process.cwd();

	var backupFilePath = path.join(cwd, '_backup', filePath.replace(cwd, ''));

	if (!fs.existsSync(backupFilePath) && _.includes(coreThemeStructure, fileName)) {
		backupFilePath = backupFilePath.replace('\.scss', '\.css');
	}

	return backupFilePath;
}

function gulpCssDiff(options) {
	options = options || {};

	var originalFilesPath;
	var updatedFilesPath;

	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

		if (file.isBuffer()) {
			var fileContentsString = file.contents.toString('utf8');

			var backupFilePath = getBackupFilePath(file.path);

			var backupFileContentsString = fs.readFileSync(backupFilePath, {
				encoding: 'utf8'
			});

			var filesPatch = jsDiff.createTwoFilesPatch(
				path.basename(backupFilePath),
				path.basename(file.path),
				backupFileContentsString,
				fileContentsString,
				'Original File',
				'Updated File'
			);

			file.contents = new Buffer(filesPatch);
		}

		cb(null, file);
	});
}

module.exports = gulpCssDiff;