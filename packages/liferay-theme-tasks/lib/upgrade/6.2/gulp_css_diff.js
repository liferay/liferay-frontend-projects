'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var jsDiff = require('diff');
var path = require('path');
var through = require('through2');

var renamedCssFiles = require('./theme_data/renamed_css_files.json');

var CWD = process.cwd();

function getBackupFilePath(filePath) {
	var fileName = path.basename(filePath, path.extname(filePath));

	var backupFilePath = path.join(CWD, '_backup', filePath.replace(CWD, ''));

	if (!fs.existsSync(backupFilePath) && _.includes(renamedCssFiles, fileName)) {
		backupFilePath = backupFilePath.replace('\.scss', '\.css');
	}

	return backupFilePath;
}

function gulpCssDiff(options) {
	options = options || {};

	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

		if (file.isBuffer()) {
			var fileContentsString = file.contents.toString('utf8');

			var backupFilePath = getBackupFilePath(file.path);

			var filesPatch = '';

			if (fs.existsSync(backupFilePath)) {
				var backupFileContentsString = fs.readFileSync(backupFilePath, {
					encoding: 'utf8'
				});

				filesPatch = jsDiff.createTwoFilesPatch(
					path.basename(backupFilePath),
					path.basename(file.path),
					backupFileContentsString,
					fileContentsString,
					'Original File',
					'Updated File'
				);
			}

			file.contents = new Buffer(filesPatch);
		}

		cb(null, file);
	});
}

module.exports = gulpCssDiff;