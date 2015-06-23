'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var inquirer = require('inquirer');
var npm = require('npm');
var themeFinder = require('../lib/theme_finder');

function ExtendPrompt(options, cb) {
	var instance = this;

	instance.done = cb;
	instance.store = options.store;

	instance._prompt(options);
}

ExtendPrompt.prototype = {
	_afterPrompt: function(answers) {
		var instance = this;

		var install = !_.isUndefined(answers.globalModules);

		answers = instance._normalizeAnswers(answers);

		instance.store.store(answers);

		if (install) {
			instance._saveDependencies(answers.themeletDependencies);

			instance._installDependencies(answers.themeletDependencies, function(err, data) {
				if (err) throw err;

				if (instance.done) {
					instance.done();
				}
			});
		}
	},

	_getThemeletDependenciesFromAnswers: function(answers) {
		var extendableThemes = this._extendableThemes;

		var themeletDependencies = _.map(answers.globalModules, function(item, index) {
			var extendableTheme = extendableThemes[item];

			return {
				liferayTheme: extendableTheme.liferayTheme,
				name: item,
				path: extendableTheme.realPath
			};
		});

		return themeletDependencies;
	},

	_installDependencies: function(themeletDependencies, cb) {
		var modules = this._normalizeDependencies(themeletDependencies);

		npm.load({
			loaded: false
		}, function() {
			npm.commands.install(process.cwd(), modules, cb);
		});
	},

	_normalizeAnswers: function(answers) {
		var themeletDependencies = this._normalizeThemeletDependencies(answers);

		answers.themeletDependencies = themeletDependencies;
		answers.themeSource = undefined;

		return answers;
	},

	_normalizeDependencies: function(themeletDependencies) {
		return _.map(themeletDependencies, function(item, index) {
			var path = item.path;

			return path ? path : item.name;
		});
	},

	_normalizeThemeletDependencies: function(answers) {
		var instance = this;

		var extendableThemes = instance._extendableThemes;
		var globalModules = (answers.themeSource == 'global');

		var storedThemeletDependencies = _.reduce(instance.store.get('themeletDependencies'), function(result, item, index) {
			var keep = (globalModules && !item.path) || (!globalModules && item.path);

			if (keep) {
				result.push(item);
			}

			return result;
		}, []);

		var themeletDependencies = instance._getThemeletDependenciesFromAnswers(answers);

		return themeletDependencies.concat(storedThemeletDependencies);
	},

	_prompt: function(options) {
		var instance = this;

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Globally installed npm modules',
							value: 'global'
						},
						{
							name: 'npm registry (published modules)',
							value: 'npm'
						}
					],
					message: 'Where would you like to search for themes to extend?',
					name: 'themeSource',
					type: 'list',
					filter: function(input) {
						var done = this.async();

						var retVal = input;

						themeFinder.getLiferayThemeModules({
							globalModules: input == 'global',
							themelet: true
						}, function(extendableThemes) {
							instance._extendableThemes = extendableThemes;

							done(retVal);
						});
					}
				},
				{
					choices: function() {
						var globalModules = instance.store.get('globalModules');

						return _.map(instance._extendableThemes, function(item, index) {
							var checked = globalModules && (globalModules.indexOf(item.name) > -1);

							return {
								checked: checked,
								name: item.name,
								value: item.name
							};
						});
					},
					message: 'What themelet would you like to extend?',
					name: 'globalModules',
					type: 'checkbox',
					when: function(answers) {
						var empty = _.isEmpty(instance._extendableThemes);

						if (empty) {
							console.warn('No themes found!');
						}

						return !empty;
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_saveDependencies: function(themeletDependencies) {
		var updatePackageJSON = require('../lib/update_package_json');

		var data = {
			dependencies: _.reduce(themeletDependencies, function(result, item, index) {
				result[item.name] = '*';

				return result;
			}, {})
		}

		updatePackageJSON(data);
	}
};

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	gulp.task(
		'extend',
		function(cb) {
			new ExtendPrompt({
				store: store
			}, cb);
		}
	);
}