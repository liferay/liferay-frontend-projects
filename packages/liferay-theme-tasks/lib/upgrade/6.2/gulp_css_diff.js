'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const jsDiff = require('diff');
const path = require('path');
const through = require('through2');

const renamedCssFiles = require('./theme_data/renamed_css_files.json');

const CWD = process.cwd();

function getBackupFilePath(filePath) {
	const fileName = path.basename(filePath, path.extname(filePath));

	let backupFilePath = path.join(CWD, '_backup', filePath.replace(CWD, ''));

	if (
		!fs.existsSync(backupFilePath) &&
		_.includes(renamedCssFiles, fileName.replace('_', ''))
	) {
		const fileBasename = path.basename(backupFilePath);

		const oldFileBasename = fileBasename
			.replace('.scss', '.css')
			.replace('_', '');

		backupFilePath = backupFilePath.replace(fileBasename, oldFileBasename);
	}

	return backupFilePath;
}

function gulpCssDiff(_options) {
	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			return cb(null, file);
		}

		if (file.isBuffer()) {
			const fileContentsString = file.contents.toString('utf8');

			const backupFilePath = getBackupFilePath(file.path);

			let filesPatch = '';

			if (fs.existsSync(backupFilePath)) {
				const backupFileContentsString = fs.readFileSync(
					backupFilePath,
					{
						encoding: 'utf8',
					}
				);

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
