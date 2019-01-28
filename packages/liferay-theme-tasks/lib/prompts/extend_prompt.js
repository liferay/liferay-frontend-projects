const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));
const exec = require('child_process').exec;
const inquirer = require('inquirer');

const GlobalModulePrompt = require('./global_module_prompt');
const lfrThemeConfig = require('../liferay_theme_config');
const NPMModulePrompt = require('./npm_module_prompt');
const promptUtil = require('./prompt_util');
const themeFinder = require('../theme_finder');

const moduleName = argv.name;

class ExtendPrompt {
	constructor(...args) {
		this.init(...args);
	}

	init(config, cb) {
		this.themeConfig = config.themeConfig || lfrThemeConfig.getConfig();

		this.done = cb;

		if (moduleName) {
			themeFinder.getLiferayThemeModule(moduleName, (err, pkg) => {
				if (err) {
					throw err;
				}

				let modules = {};

				modules[moduleName] = pkg;

				if (pkg.liferayTheme.themelet) {
					this._afterPromptThemelets({
						addedThemelets: [moduleName],
						modules: modules,
					});
				} else {
					this._afterPromptTheme({
						module: moduleName,
						modules: modules,
					});
				}
			});
		} else {
			this._promptThemeSource();
		}
	}

	_afterPromptModule(answers) {
		if (answers.addedThemelets) {
			this._afterPromptThemelets(answers);
		} else {
			this._afterPromptTheme(answers);
		}
	}

	_afterPromptTheme(answers) {
		const baseTheme = this.themeConfig.baseTheme;
		const module = answers.module;
		const modulePackages = answers.modules;

		if (!module) {
			this.done();

			return;
		}

		if (_.isObject(baseTheme)) {
			lfrThemeConfig.removeDependencies([baseTheme.name]);
		}

		let reducedPkg = this._reducePkgData(modulePackages[module]);

		lfrThemeConfig.setConfig({
			baseTheme: reducedPkg,
		});

		this._saveDependencies([reducedPkg]);

		this._installDependencies([reducedPkg], () => this.done());
	}

	_afterPromptThemelets(answers) {
		const modulePackages = answers.modules;
		const themeletDependencies =
			this.themeConfig.themeletDependencies || {};

		const reducedThemelets = _.reduce(
			answers.addedThemelets,
			(result, item) => {
				result[item] = this._reducePkgData(modulePackages[item]);

				return result;
			},
			themeletDependencies
		);

		const removedThemelets = answers.removedThemelets;

		if (removedThemelets) {
			_.forEach(removedThemelets, function(item) {
				delete reducedThemelets[item];
			});

			lfrThemeConfig.removeDependencies(removedThemelets);
		}

		lfrThemeConfig.setConfig({
			themeletDependencies: reducedThemelets,
		});

		this._saveDependencies(reducedThemelets);

		if (answers.addedThemelets.length) {
			this._installDependencies(reducedThemelets, () => this.done());
		} else {
			this.done();
		}
	}

	_afterPromptThemeSource(answers) {
		const themelet = answers.extendType === 'themelet';
		const themeSource = answers.themeSource;

		if (themeSource === 'styled' || themeSource === 'unstyled') {
			this._setStaticBaseTheme(themeSource);
		} else {
			let config = {
				selectedModules: this._getSelectedModules(themelet),
				themelet: themelet,
			};

			if (themeSource === 'global') {
				GlobalModulePrompt.prompt(
					config,
					_.bind(this._afterPromptModule, this)
				);
			} else if (themeSource === 'npm') {
				NPMModulePrompt.prompt(
					config,
					_.bind(this._afterPromptModule, this)
				);
			}
		}
	}

	_filterExtendType(input) {
		this._extendType = input;

		return input;
	}

	_getDependencyInstallationArray(dependencies) {
		const themeVersion = this.themeConfig.version;

		return _.map(dependencies, item => {
			const path = item.path;

			return path
				? path
				: item.name + this._getDistTag(item, themeVersion, '@');
		});
	}

	_getDistTag(config, version, prefix) {
		const supportedVersion = config.liferayTheme.version;

		let tag = prefix || '';

		if (
			this._isSupported(supportedVersion, version) &&
			this._hasPublishTag(config)
		) {
			tag += version.replace('.', '_') + '_x';
		} else {
			tag += '*';
		}

		return tag;
	}

	_getSelectedModules(themelet) {
		const baseTheme = this.themeConfig.baseTheme;

		let selectedModules;

		if (themelet) {
			selectedModules = _.map(
				this.themeConfig.themeletDependencies,
				item => item.name
			);
		} else if (_.isObject(baseTheme)) {
			selectedModules = [baseTheme.name];
		}

		return selectedModules;
	}

	_getThemeSourceChoices() {
		const extendType = this._extendType;

		let searchOptions = [
			{
				name:
					'Search globally installed npm modules (development purposes only)',
				value: 'global',
			},
			{
				name: 'Search npm registry (published modules)',
				value: 'npm',
			},
		];

		if (extendType === 'theme') {
			let baseThemeChoices = [
				{
					name: 'Styled',
					value: 'styled',
				},
				{
					name: 'Unstyled',
					value: 'unstyled',
				},
				new inquirer.Separator(),
			];

			searchOptions = baseThemeChoices.concat(searchOptions);
		}

		return searchOptions;
	}

	_getThemeSourceMessage() {
		return this._extendType === 'theme'
			? 'What base theme would you like to extend?'
			: 'Where would you like to search for themelets?';
	}

	_hasPublishTag(config) {
		return config.publishConfig && config.publishConfig.tag;
	}

	_installDependencies(dependencies, cb, hideOutput) {
		const modules = this._getDependencyInstallationArray(dependencies);

		const child = exec('npm install ' + modules.join(' '), cb);

		if (!hideOutput) {
			child.stderr.pipe(process.stdout);
			child.stdout.pipe(process.stdout);
		}
	}

	_isSupported(supportedVersion, version) {
		return (
			(_.isArray(supportedVersion) &&
				_.includes(supportedVersion, version)) ||
			supportedVersion === version
		);
	}

	_promptThemeSource() {
		const listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Base theme',
							value: 'theme',
						},
						{
							name: 'Themelet',
							value: 'themelet',
						},
					],
					filter: _.bind(this._filterExtendType, this),
					message:
						'What kind of theme asset would you like to extend?',
					name: 'extendType',
					type: listType,
				},
				{
					choices: _.bind(this._getThemeSourceChoices, this),
					message: _.bind(this._getThemeSourceMessage, this),
					name: 'themeSource',
					type: listType,
				},
			],
			_.bind(this._afterPromptThemeSource, this)
		);
	}

	_reducePkgData(pkg) {
		const realPath = pkg.realPath;

		pkg = _.pick(pkg, ['liferayTheme', 'name', 'publishConfig', 'version']);

		if (realPath) {
			pkg.path = realPath;
		}

		return pkg;
	}

	_saveDependencies(updatedData) {
		const themeVersion = this.themeConfig.version;

		const dependencies = _.reduce(
			updatedData,
			(result, item) => {
				const moduleVersion = item.path
					? item.path
					: this._getDistTag(item, themeVersion);

				result[item.name] = moduleVersion;

				return result;
			},
			{}
		);

		lfrThemeConfig.setDependencies(dependencies);
	}

	_setStaticBaseTheme(themeSource) {
		const baseTheme = this.themeConfig.baseTheme;

		if (_.isObject(baseTheme)) {
			lfrThemeConfig.removeDependencies([baseTheme.name]);
		}

		lfrThemeConfig.setConfig({
			baseTheme: themeSource,
		});

		this.done();
	}
}

ExtendPrompt.prompt = (config, cb) => new ExtendPrompt(config, cb);

module.exports = ExtendPrompt;
