'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var inquirer = require('inquirer');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var util = require('util');

module.exports = function(options) {
	var gulp = options.gulp;

	plugins.storage(gulp);

	var store = gulp.storage;

	store.create('LiferayTheme', 'liferay-theme.json');

	gulp.task(
		'init',
		function(cb) {
			var cwd = process.cwd();

			var appServerPathDefault = store.get('appServerPath') || path.join(path.dirname(cwd), 'tomcat');

			inquirer.prompt(
				[
					{
						default: appServerPathDefault,
						message: 'Enter the path to your app server directory:',
						name: 'appServerPath',
						type: 'input',
						validate: function(appServerPath) {
							var retVal = false;

							if (appServerPath) {
								retVal = true;

								if (!fs.existsSync(appServerPath)) {
									retVal = '"%s" does not exist';
								}
								else if (!fs.statSync(appServerPath).isDirectory()) {
									retVal = '"%s" is not a directory';
								}
								else {
									var baseName = path.basename(appServerPath);

									if (baseName == 'webapps') {
										appServerPath = path.dirname(appServerPath);
									}

									var webappsPath = path.join(appServerPath, 'webapps');

									if (!fs.existsSync(webappsPath) || !fs.statSync(webappsPath).isDirectory()) {
										retVal = '"%s" doesnt appear to be an app server directory';
									}
								}
							}

							if (_.isString(retVal)) {
								retVal = util.format(retVal, appServerPath);
							}

							return retVal;
						}
					},
					{
						default: function(answers) {
							return path.join(answers.appServerPath, '../deploy');
						},
						message: 'Enter in your deploy directory:',
						name: 'deployPath',
						type: 'input',
						when: function(answers) {
							var appServerPath = answers.appServerPath;
							var deployPath = path.resolve(path.join(appServerPath, '../deploy'));

							var done = this.async();

							fs.stat(
								deployPath,
								function(err, stats) {
									var ask = err || !stats.isDirectory();

									if (!ask) {
										answers.deployPath = deployPath;
									}

									done(ask);
								}
							);
						}
					},
					{
						choices: [
							{
								name: 'Styled',
								value: 'styled'
							},
							{
								name: 'Unstyled',
								value: 'unstyled'
							}
						],
						message: 'When building this theme, what theme should it inherit from?',
						name: 'baseTheme',
						type: 'list'
					}
				],
				function(answers) {
					var appServerPath = answers.appServerPath;

					var baseName = path.basename(appServerPath);

					if (baseName != 'webapps') {
						appServerPath = path.join(appServerPath, 'webapps');
					}

					var themeName = path.basename(process.cwd());

					var appServerPathTheme = path.join(appServerPath, themeName);

					answers = _.assign(
						answers,
						{
							appServerPathTheme: appServerPathTheme,
							deployed: false,
							themeName: themeName
						}
					);

					store.store(answers);

					cb();
				}
			);
		}
	);
}