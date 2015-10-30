'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var lfrThemeConfig = require('./liferay_theme_config');
var themeFinder = require('./theme_finder');

var moduleName = argv.name;

function ExtendPrompt(cb) {
	var instance = this;

	this.done = cb;

	if (moduleName) {
		themeFinder.getLiferayThemeModule(moduleName, function(err, pkg) {
			if (err) throw err;

			var dependencyPropertyName = 'baseTheme';

			if (pkg.liferayTheme.themelet) {
				dependencyPropertyName = 'themeletDependencies';
			}

			var config = _.set({}, dependencyPropertyName + '.' + moduleName, instance._reducePkgData(pkg));

			lfrThemeConfig.setConfig(config);

			instance._saveDependencies(config[dependencyPropertyName]);

			cb();
		});
	}
	else {
		this._prompt();
	}
}

ExtendPrompt.prototype = {
	_afterPrompt: function(answers) {
		var instance = this;

		instance._removeUnusedDependencies(answers);

		answers = instance._normalizeAnswers(answers);

		lfrThemeConfig.setConfig(answers);

		if (!_.isUndefined(answers.themeletDependencies) || !_.isUndefined(answers.baseTheme)) {
			var updatedData = answers.baseTheme ? answers.baseTheme : answers.themeletDependencies;

			if (answers.baseTheme && _.isObject(answers.baseTheme)) {
				var baseThemeObj = {};

				baseThemeObj[answers.baseTheme.name] = answers.baseTheme;

				updatedData = baseThemeObj;
			}

			if (_.isObject(updatedData)) {
				instance._saveDependencies(updatedData);

				instance._installDependencies(updatedData, function(err, data) {
					if (err) throw err;

					if (instance.done) {
						instance.done();
					}
				});
			}
		}
	},

	_extendTypeConditional: function(type) {
		var retVal = (this._extendType == type);

		if (retVal) {
			var empty = _.isEmpty(this._extendableThemes);

			if (empty) {
				gutil.log(gutil.colors.yellow('No ' + type + 's found!'));
			}

			retVal = !empty;
		}

		return retVal;
	},

	_getDependencyInstallationArray: function(dependencies) {
		var instance = this;

		var themeVersion = lfrThemeConfig.getConfig().version;

		return _.map(dependencies, function(item, index) {
			var path = item.path;

			return path ? path : item.name + instance._getDistTag(item, themeVersion, '@');
		});
	},

	_getDistTag: function(config, version, prefix) {
		var supportedVersion = config.liferayTheme.version;

		var tag = prefix || '';

		if (this._isSupported(supportedVersion, version) && this._hasPublishTag(config)) {
			tag += version.replace('.', '_') + '_x';
		}
		else {
			tag += '*';
		}

		return tag;
	},

	_getListType: function() {
		var listType = 'list';

		var os = require('os');

		if (process.version > 'v0.12.7' && os.type() == 'Windows_NT') {
			listType = 'rawlist';
		}

		return listType;
	},

	_getThemeletDependenciesFromAnswers: function(answers) {
		var instance = this;

		var extendableThemes = this._extendableThemes;

		var themeletNames = answers.themeletNames;

		if (themeletNames && !_.isArray(themeletNames)) {
			themeletNames = [themeletNames];
		}

		var themeletDependencies = _.reduce(themeletNames, function(result, item, index) {
			var extendableTheme = extendableThemes[item];

			if (_.isUndefined(extendableTheme)) {
				instance._handleMissingModule(item, answers, 'themelet');

				return;
			}

			result[item] = instance._reducePkgData(extendableTheme);

			return result;
		}, {});

		return themeletDependencies;
	},

	_getUnusedDependencies: function(answers) {
		var removedDependencies = [];

		if (answers.baseThemeName) {
			var baseTheme = lfrThemeConfig.getConfig().baseTheme;

			if (_.isObject(baseTheme)) {
				removedDependencies.push(baseTheme.name);
			}
		}

		return removedDependencies.concat(_.difference(this._themeletChoices, answers.themeletNames));
	},

	_handleMissingModule: function(name, answers, type) {
		var message = (answers.extendType == type) ? name + ' not found!' : null;

		if (message) {
			gutil.log(gutil.colors.yellow(message));
		}
	},

	_hasPublishTag: function(config) {
		return config.publishConfig && config.publishConfig.tag;
	},

	_installDependencies: function(dependencies, cb) {
		var modules = this._getDependencyInstallationArray(dependencies);

		var child = exec('npm install ' + modules.join(' '), cb);

		child.stdout.on('data', function(data) {
			process.stdout.write(data);
		});

		child.stderr.on('data', function(data) {
			process.stdout.write(data);
		});
	},

	_isSupported: function(supportedVersion, version) {
		return (_.isArray(supportedVersion) && _.contains(supportedVersion, version)) || supportedVersion == version;
	},

	_normalizeAnswers: function(answers) {
		var baseTheme = this._normalizeBaseTheme(answers);

		if (baseTheme) {
			answers.baseTheme = baseTheme;
		}

		var themeletDependencies = this._normalizeThemeletDependencies(answers);

		if (answers.extendType == 'themelet') {
			answers.themeletDependencies = themeletDependencies;
		}

		answers.baseThemeName = undefined;
		answers.extendType = undefined;
		answers.themeletNames = undefined;
		answers.themeSource = undefined;

		return answers;
	},

	_normalizeBaseTheme: function(answers) {
		var instance = this;

		if (answers.extendType == 'theme') {
			var themeSource = answers.themeSource;

			if (themeSource == 'styled' || themeSource == 'unstyled') {
				answers.baseThemeName = themeSource;
			}

			var baseThemeName = answers.baseThemeName;

			if (baseThemeName == 'styled' || baseThemeName == 'unstyled') {
				return baseThemeName;
			}
			else if (baseThemeName) {
				var baseTheme = this._extendableThemes[baseThemeName];

				if (_.isUndefined(baseTheme)) {
					instance._handleMissingModule(baseThemeName, answers, 'theme');

					return;
				}

				return {
					liferayTheme: baseTheme.liferayTheme,
					name: baseTheme.name,
					path: baseTheme.realPath,
					publishConfig: baseTheme.publishConfig,
					version: baseTheme.version
				};
			}
		}
	},

	_normalizeThemeletDependencies: function(answers) {
		var instance = this;

		var globalModules = (answers.themeSource == 'global');

		var themeConfig = lfrThemeConfig.getConfig();

		var version = themeConfig.version;

		var savedThemeletDependencies = _.reduce(themeConfig.themeletDependencies, function(result, item, index) {
			var keep = (globalModules && !item.path) || (!globalModules && item.path);

			var itemVersion = item.liferayTheme.version;

			if ((itemVersion != version) && (itemVersion != '*')) {
				keep = true;
			}

			if (keep) {
				result[index] = item;
			}

			return result;
		}, {});

		var themeletDependencies = instance._getThemeletDependenciesFromAnswers(answers);

		return _.merge(savedThemeletDependencies, themeletDependencies);
	},

	_prompt: function(options) {
		var instance = this;

		var listType = instance._getListType();

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Base theme',
							value: 'theme'
						},
						{
							name: 'Themelet',
							value: 'themelet'
						}
					],
					filter: function(input) {
						instance._extendType = input;

						return input;
					},
					message: 'What kind of theme asset would you like to extend?',
					name: 'extendType',
					type: listType
				},
				{
					choices: function() {
						var extendType = instance._extendType;

						var searchOptions = [
							{
								name: 'Search globally installed npm modules',
								value: 'global'
							},
							{
								name: 'Search npm registry (published modules)',
								value: 'npm'
							}
						];

						if (extendType == 'theme') {
							var baseThemeChoices = [
								{
									name: 'Styled',
									value: 'styled'
								},
								{
									name: 'Unstyled',
									value: 'unstyled'
								},
								new inquirer.Separator()
							];

							searchOptions = baseThemeChoices.concat(searchOptions);
						}

						return searchOptions;
					},
					message: function() {
						return instance._extendType == 'theme' ? 'What base theme would you like to extend?' : 'Where would you like to search for themelets?';
					},
					name: 'themeSource',
					type: listType,
					filter: function(input) {
						var done = this.async();

						if (input == 'styled' || input == 'unstyled') {
							done(input);
						}
						else {
							themeFinder.getLiferayThemeModules({
								globalModules: (input == 'global'),
								themelet: (instance._extendType == 'themelet')
							}, function(extendableThemes) {
								instance._extendableThemes = extendableThemes;

								done(input);
							});
						}
					}
				},
				{
					choices: function() {
						var savedThemeletDependencies = lfrThemeConfig.getConfig().themeletDependencies;

						instance._themeletChoices = [];

						return _.map(instance._extendableThemes, function(item, index) {
							var checked = savedThemeletDependencies && (savedThemeletDependencies[item.name]);

							instance._themeletChoices.push(item.name);

							return {
								checked: checked,
								name: item.name,
								value: item.name
							};
						});
					},
					message: 'What themelet would you like to extend?',
					name: 'themeletNames',
					type: 'checkbox',
					when: function(answers) {
						return instance._extendTypeConditional('themelet');
					}
				},
				{
					choices: function(answers) {
						var themeConfig = lfrThemeConfig.getConfig(true);

						var extendableThemeChoices = _.reduce(instance._extendableThemes, function(result, item, index) {
							if (themeConfig.name != item.name) {
								result.push({
									name: item.name,
									value: item.name
								});
							}

							return result;
						}, []);

						return extendableThemeChoices;
					},
					message: 'What base theme would you like to extend?',
					name: 'baseThemeName',
					type: listType,
					when: function(answers) {
						var themeSource = answers.themeSource;

						return (themeSource == 'global' || themeSource == 'npm') && instance._extendTypeConditional('theme');
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_reducePkgData: function(pkg) {
		var realPath = pkg.realPath;

		pkg = _.pick(pkg, ['liferayTheme', 'name', 'publishConfig', 'version']);

		pkg.path = realPath;

		return pkg;
	},

	_removeUnusedDependencies: function(answers) {
		lfrThemeConfig.removeDependencies(this._getUnusedDependencies(answers));
	},

	_saveDependencies: function(updatedData) {
		var instance = this;

		var themeVersion = lfrThemeConfig.getConfig().version;

		var dependencies = _.reduce(updatedData, function(result, item, index) {
			var moduleVersion = item.path ? item.path : instance._getDistTag(item, themeVersion);

			result[item.name] = moduleVersion;

			return result;
		}, {});

		lfrThemeConfig.setConfig(dependencies, true);
	}
};

module.exports = ExtendPrompt;