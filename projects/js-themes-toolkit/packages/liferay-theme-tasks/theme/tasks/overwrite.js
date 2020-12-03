/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const log = require('fancy-log');
const fs = require('fs');
const inquirer = require('inquirer');
const {
	default: FilePath,
} = require('liferay-npm-build-tools-common/lib/file-path');
const _ = require('lodash');
const path = require('path');

const project = require('../../lib/project');

module.exports = function() {
	const {gulp} = project;
	const {pathBuild, pathSrc} = project.options;

	gulp.task('overwrite', cb => {
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
		const buildFiles = readdir(
			path.join(project.dir, pathBuild.asNative, dirPath)
		);
		const srcFiles = readdir(
			path.join(project.dir, pathSrc.asNative, dirPath)
		);

		const choices = _.reduce(
			buildFiles,
			(result, item) => {
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
				parentPath === '.' ? pathBuild.basename().asNative : parentPath;
			goBackChoice.value.path = parentPath;

			choices.splice(0, 0, goBackChoice);
		}

		return choices;
	}

	function isDir(filePath) {
		return fs
			.statSync(path.join(project.dir, pathBuild.asNative, filePath))
			.isDirectory();
	}

	function logChanges(filePath) {
		const themeDirName = path.basename(project.dir);

		const destFile = colors.cyan(
			path.join(themeDirName, pathSrc.asNative, filePath)
		);
		const srcFile = colors.cyan(
			path.join(themeDirName, pathBuild.asNative, filePath)
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
			answers => {
				if (answers.file.dir) {
					promptFiles(answers.file.path, cb);
				} else {
					logChanges(answers.file.path);

					gulp.src(
						pathBuild.join(new FilePath(answers.file.path)).asPosix,
						{
							base: pathBuild.asNative,
						}
					)
						.pipe(gulp.dest(pathSrc.asNative))
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
