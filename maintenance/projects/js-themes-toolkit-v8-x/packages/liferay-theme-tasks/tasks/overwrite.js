/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const fs = require('fs');
const inquirer = require('inquirer');
const log = require('fancy-log');
const path = require('path');

const CWD = process.cwd();

module.exports = function(options) {
	const gulp = options.gulp;

	const pathBuild = options.pathBuild;
	const pathSrc = options.pathSrc;

	gulp.task('overwrite', function(cb) {
		promptFiles('.', cb);
	});

	const blacklistedDirs = ['WEB-INF'];

	const goBackChoice = {
		name: '^ Up one directory',
		value: {
			dir: true,
		},
	};

	function getFileChoices(dirPath) {
		const buildFiles = readdir(path.join(CWD, pathBuild, dirPath));
		const srcFiles = readdir(path.join(CWD, pathSrc, dirPath));

		const choices = _.reduce(
			buildFiles,
			function(result, item) {
				const filePath = path.join(dirPath, item);

				const dir = isDir(filePath);

				const name = dir ? item + '/' : item;

				if (
					(!dir && srcFiles.indexOf(item) > -1) ||
					(dir && blacklistedDirs.indexOf(item) > -1)
				) {
					return result;
				}

				result.push({
					name,
					short: filePath,
					value: {
						dir,
						path: filePath,
					},
				});

				return result;
			},
			[]
		);

		const parentPath = path.join(dirPath, '..');

		if (dirPath !== '.') {
			goBackChoice.short =
				parentPath === '.' ? path.basename(pathBuild) : parentPath;
			goBackChoice.value.path = parentPath;

			choices.splice(0, 0, goBackChoice);
		}

		return choices;
	}

	function isDir(filePath) {
		return fs.statSync(path.join(CWD, pathBuild, filePath)).isDirectory();
	}

	function logChanges(filePath) {
		const themeDirName = path.basename(CWD);

		const destFile = colors.cyan(
			path.join(themeDirName, pathSrc, filePath)
		);
		const srcFile = colors.cyan(
			path.join(themeDirName, pathBuild, filePath)
		);

		log(srcFile, 'copied to', destFile);
	}

	function promptFiles(dirPath, cb) {
		const choices = getFileChoices(dirPath);

		if (dirPath === '.' && !validateBuild(choices)) {
			log(
				colors.yellow(
					'You must run',
					colors.cyan('gulp build'),
					'prior to using the overwrite task!'
				)
			);

			return cb();
		}

		inquirer.prompt(
			{
				choices,
				message: 'Please select a file or folder',
				name: 'file',
				type: 'list',
			},
			function(answers) {
				if (answers.file.dir) {
					promptFiles(answers.file.path, cb);
				} else {
					logChanges(answers.file.path);

					gulp.src(path.join(pathBuild, answers.file.path), {
						base: pathBuild,
					})
						.pipe(gulp.dest(pathSrc))
						.on('end', cb);
				}
			}
		);
	}

	function readdir(dirPath) {
		let files = [];

		try {
			files = fs.readdirSync(dirPath);
		} catch (err) {
			// Swallow.
		}

		return files;
	}

	function validateBuild(choices) {
		return choices.length > 1;
	}
};
