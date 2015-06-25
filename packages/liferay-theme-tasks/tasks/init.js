'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var inquirer = require('inquirer');
var npm = require('npm');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var themeFinder = require('../lib/theme_finder');
var util = require('util');

var STR_PACKAGE_JSON = 'package.json';

function InitPrompt(options, cb) {
	var instance = this;

	instance.done = cb;
	instance.store = options.store;

	instance._prompt(options);
}

InitPrompt.prototype = {
	_afterPrompt: function(answers) {
		answers = this._normalizeAnswers(answers);

		this.store.store(answers);

		if (this.done) {
			this.done();
		}
	},

	_deployPathWhen: function(answers) {
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
	},

	_normalizeAnswers: function(answers) {
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
				baseTheme: 'styled',
				deployed: false,
				themeName: themeName
			}
		);

		return answers;
	},

	_prompt: function(options, cb) {
		var instance = this;

		inquirer.prompt(
			[
				{
					default: options.appServerPathDefault,
					message: 'Enter the path to your app server directory:',
					name: 'appServerPath',
					type: 'input',
					validate: instance._validateAppServerPath
				},
				{
					default: function(answers) {
						return path.join(answers.appServerPath, '../deploy');
					},
					message: 'Enter in your deploy directory:',
					name: 'deployPath',
					type: 'input',
					when: instance._deployPathWhen
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_validateAppServerPath: function(appServerPath) {
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
					retVal = '"%s" doesn\'t appear to be an app server directory';
				}
			}
		}

		if (_.isString(retVal)) {
			retVal = util.format(retVal, appServerPath);
		}

		return retVal;
	}
};

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var cwd = process.cwd();

	gulp.task(
		'init',
		function(cb) {
			new InitPrompt({
				appServerPathDefault: store.get('appServerPath') || path.join(path.dirname(cwd), 'tomcat'),
				store: store
			}, cb);
		}
	);
}