'use strict';

let _ = require('lodash');
let fs = require('fs');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let path = require('path');

let chalk = gutil.colors;

let CWD = process.cwd();

module.exports = function(options) {
	let gulp = options.gulp;

	let pathBuild = options.pathBuild;
	let pathSrc = options.pathSrc;

	gulp.task('overwrite', function(cb) {
		promptFiles('.', cb);
	});

	let blacklistedDirs = ['WEB-INF'];

	let goBackChoice = {
		name: '^ Up one directory',
		value: {
			dir: true,
		},
	};

	function getFileChoices(dirPath) {
		let buildFiles = readdir(path.join(CWD, pathBuild, dirPath));
		let srcFiles = readdir(path.join(CWD, pathSrc, dirPath));

		let choices = _.reduce(
			buildFiles,
			function(result, item) {
				let filePath = path.join(dirPath, item);

				let dir = isDir(filePath);

				let name = dir ? item + '/' : item;

				if (
					(!dir && srcFiles.indexOf(item) > -1) ||
					(dir && blacklistedDirs.indexOf(item) > -1)
				) {
					return result;
				}

				result.push({
					name: name,
					short: filePath,
					value: {
						dir: dir,
						path: filePath,
					},
				});

				return result;
			},
			[]
		);

		let parentPath = path.join(dirPath, '..');

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
		let themeDirName = path.basename(CWD);

		let destFile = chalk.cyan(path.join(themeDirName, pathSrc, filePath));
		let srcFile = chalk.cyan(path.join(themeDirName, pathBuild, filePath));

		gutil.log(srcFile, 'copied to', destFile);
	}

	function promptFiles(dirPath, cb) {
		let choices = getFileChoices(dirPath);

		if (dirPath === '.' && !validateBuild(choices)) {
			gutil.log(
				chalk.yellow(
					'You must run',
					chalk.cyan('gulp build'),
					'prior to using the overwrite task!'
				)
			);

			return cb();
		}

		inquirer.prompt(
			{
				choices: choices,
				message: 'Please select a file or folder',
				name: 'file',
				type: 'list',
			},
			function(answers) {
				if (answers.file.dir) {
					promptFiles(answers.file.path, cb);
				} else {
					logChanges(answers.file.path);

					gulp
						.src(path.join(pathBuild, answers.file.path), {
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
		} catch (err) {}

		return files;
	}

	function validateBuild(choices) {
		return choices.length > 1;
	}
};
