'use strict';

var _ = require('lodash');
var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var gutil = require('gulp-util');

var chalk = gutil.colors;

var CWD = process.cwd();

module.exports = function(options) {
	var gulp = options.gulp;

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	gulp.task('overwrite', function(cb) {
		promptFiles('.', cb);
	});

	var blacklistedDirs = ['WEB-INF'];

	var goBackChoice = {
		name: '^ Up one directory',
		value: {
			dir: true
		}
	};

	function getFileChoices(dirPath) {
		var buildFiles = readdir(path.join(CWD, pathBuild, dirPath));
		var srcFiles = readdir(path.join(CWD, pathSrc, dirPath));

		var choices = _.reduce(buildFiles, function(result, item, index) {
			var filePath = path.join(dirPath, item);

			var dir = isDir(filePath);

			var name = dir ? item + '/' : item;

			if ((!dir && srcFiles.indexOf(item) > -1) || (dir && blacklistedDirs.indexOf(item) > -1)) {
				return result;
			}

			result.push({
				name: name,
				short: filePath,
				value: {
					dir: dir,
					path: filePath
				}
			});

			return result;
		}, []);

		var parentPath = path.join(dirPath, '..');

		if (dirPath != '.') {
			goBackChoice.short = parentPath == '.' ? path.basename(pathBuild) : parentPath;
			goBackChoice.value.path = parentPath;

			choices.splice(0, 0, goBackChoice);
		}

		return choices;
	}

	function isDir(filePath) {
		return fs.statSync(path.join(CWD, pathBuild, filePath)).isDirectory();
	}

	function logChanges(filePath) {
		var themeDirName = path.basename(CWD);

		var destFile = chalk.cyan(path.join(themeDirName, pathSrc, filePath));
		var srcFile = chalk.cyan(path.join(themeDirName, pathBuild, filePath));

		gutil.log(srcFile, 'copied to', destFile);
	}

	function promptFiles(dirPath, cb) {
		var choices = getFileChoices(dirPath);

		if (dirPath == '.' && !validateBuild(choices)) {
			gutil.log(chalk.yellow('You must run', chalk.cyan('gulp build'), 'prior to using the overwrite task!'));

			return cb();
		}

		inquirer.prompt({
			choices: choices,
			message: 'Please select a file or folder',
			name: 'file',
			type: 'list'
		}, function(answers) {
			if (!answers.file.dir) {
				logChanges(answers.file.path);

				gulp.src(path.join(pathBuild, answers.file.path), {
						base: pathBuild
					})
					.pipe(gulp.dest(pathSrc))
					.on('end', cb);
			}
			else {
				promptFiles(answers.file.path, cb);
			}
		});
	}

	function readdir(dirPath) {
		var files = [];

		try {
			files = fs.readdirSync(dirPath);
		}
		catch (e) {
		}

		return files;
	}

	function validateBuild(choices) {
		return choices.length > 1;
	}
};
