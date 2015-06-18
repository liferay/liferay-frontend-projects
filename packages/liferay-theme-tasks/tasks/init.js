'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var inquirer = require('inquirer');
var npm = require('npm');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var util = require('util');

var STR_PACKAGE_JSON = 'package.json';

function InitPrompt(options, cb) {
	var instance = this;

	instance.done = cb;
	instance.store = options.store;

	instance._getExtendableThemes(function(extendableThemes) {
		options.baseThemeOptions = instance._getBaseThemeOptions(extendableThemes);

		instance._prompt(options);
	});
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

	_getBaseThemeOptions: function(extendableThemes) {
		var instance = this;

		var baseThemeOptions = [
			{
				name: 'Styled',
				value: 'styled'
			},
			{
				name: 'Unstyled',
				value: 'unstyled'
			}
		];

		var globalBaseThemes = _.map(extendableThemes, function(item, index) {
			return {
				name: item.name,
				value: item.name
			}
		});

		return baseThemeOptions.concat(globalBaseThemes);
	},

	_getExtendableThemes: function(cb) {
		var instance = this;

		instance._getGlobalModules(function(data) {
			var extendableThemes = [];

			var extendableThemes = _.reduce(data.dependencies, function(result, item, index) {
				if (instance._isLiferayTheme(item)) {
					result[index] = item;
				}

				return result;
			}, {});

			instance._extendableThemes = extendableThemes;

			cb(extendableThemes);
		});
	},

	_getGlobalModules: function(cb) {
		npm.load({
			depth: 0,
			global: true,
			loaded: false,
			parseable: true
		}, function() {
			npm.commands.ls(null, true, function(err, data) {
				if (err) throw err;

				cb(data);
			});
		});
	},

	_isLiferayTheme: function(moduleMetaData) {
		var keywords = (_.isArray(moduleMetaData.keywords) && moduleMetaData.keywords.indexOf('liferay-theme') > -1);

		var liferayTheme = moduleMetaData.liferayTheme;

		return keywords && (liferayTheme && liferayTheme.version);
	},

	_normalizeAnswers: function(answers) {
		var appServerPath = answers.appServerPath;

		var baseName = path.basename(appServerPath);

		if (baseName != 'webapps') {
			appServerPath = path.join(appServerPath, 'webapps');
		}

		var themeName = path.basename(process.cwd());

		var appServerPathTheme = path.join(appServerPath, themeName);

		if (['styled', 'unstyled'].indexOf(answers.baseTheme) < 0) {
			answers.baseThemePath = this._extendableThemes[answers.baseTheme].realPath;
		}

		answers = _.assign(
			answers,
			{
				appServerPathTheme: appServerPathTheme,
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
				},
				{
					choices: options.baseThemeOptions,
					message: 'What theme would you like to extend?',
					name: 'baseTheme',
					type: 'list'
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_setPackageJSONBaseTheme: function() {
		var cwd = process.cwd();

		var packageJSON = require(path.join(cwd, STR_PACKAGE_JSON));

		packageJSON.liferayTheme.baseTheme = 'styled';

		fs.writeFileSync(STR_PACKAGE_JSON, JSON.stringify(packageJSON, null, '\t'));
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