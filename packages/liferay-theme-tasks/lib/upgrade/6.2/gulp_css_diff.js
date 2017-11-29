'use strict';

let _ = require('lodash');
let fs = require('fs-extra');
let jsDiff = require('diff');
let path = require('path');
let through = require('through2');

let renamedCssFiles = require('./theme_data/renamed_css_files.json');

let CWD = process.cwd();

function getBackupFilePath(filePath) {
	let fileName = path.basename(filePath, path.extname(filePath));

	let backupFilePath = path.join(CWD, '_backup', filePath.replace(CWD, ''));

	if (
		!fs.existsSync(backupFilePath) &&
		_.includes(renamedCssFiles, fileName.replace('_', ''))
	) {
		let fileBasename = path.basename(backupFilePath);

		let oldFileBasename = fileBasename
			.replace('.scss', '.css')
			.replace('_', '');

		backupFilePath = backupFilePath.replace(fileBasename, oldFileBasename);
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
			let fileContentsString = file.contents.toString('utf8');

			let backupFilePath = getBackupFilePath(file.path);

			let filesPatch = '';

			if (fs.existsSync(backupFilePath)) {
				let backupFileContentsString = fs.readFileSync(backupFilePath, {
					encoding: 'utf8',
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
