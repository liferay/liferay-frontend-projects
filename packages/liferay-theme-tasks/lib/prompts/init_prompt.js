'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var inquirer = require('inquirer');
var path = require('path');
var util = require('util');

var CWD = process.cwd();

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

		fs.stat(deployPath, function(err, stats) {
			var ask = err || !stats.isDirectory();

			if (!ask) {
				answers.deployPath = deployPath;
			}

			done(ask);
		});
	},

	_normalizeAnswers: function(answers) {
		var appServerPath = answers.appServerPath;

		var baseName = path.basename(appServerPath);

		if (baseName != 'webapps') {
			appServerPath = path.join(appServerPath, 'webapps');
		}

		var themeName = path.basename(CWD);

		var appServerPathTheme = path.join(appServerPath, themeName);

		answers = _.assign(answers, {
			appServerPathTheme: appServerPathTheme,
			deployed: false,
			themeName: themeName
		});

		return answers;
	},

	_prompt: function(options) {
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
				},
				{
					default: 'http://localhost:8080',
					message: 'Enter the url to your production or development site:',
					name: 'url',
					type: 'input'
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

module.exports = InitPrompt;