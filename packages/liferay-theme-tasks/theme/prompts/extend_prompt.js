/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const spawn = require('cross-spawn');
const inquirer = require('inquirer');
const _ = require('lodash');

const project = require('../../lib/project');
const {getArgv} = require('../../lib/util');
const themeFinder = require('../lib/theme_finder');
const GlobalModulePrompt = require('./global_module_prompt');
const NPMModulePrompt = require('./npm_module_prompt');
const URLPackagePrompt = require('./url_package_prompt');
const promptUtil = require('./util');

const moduleName = getArgv().name;

class ExtendPrompt {
	constructor(cb) {
		this.done = cb;

		if (moduleName) {
			themeFinder.getLiferayThemeModule(moduleName, (err, pkg) => {
				if (err) {
					throw err;
				}

				const modules = {};

				modules[moduleName] = pkg;

				if (pkg.liferayTheme.themelet) {
					this._afterPromptThemelets({
						addedThemelets: [moduleName],
						modules,
					});
				} else {
					this._afterPromptTheme({
						module: moduleName,
						modules,
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
		const {baseTheme} = project.themeConfig.config;
		const module = answers.module;
		const modulePackages = answers.modules;
		const pkg = modulePackages[module];

		if (!module) {
			this.done();

			return;
		}

		if (_.isObject(baseTheme)) {
			project.removeDependencies([baseTheme.name]);
		}

		const reducedPkg = this._reducePkgData(pkg);

		project.themeConfig.setConfig({
			baseTheme: reducedPkg,
		});

		this._saveDependencies([pkg]);

		this._installDependencies([pkg], () => this.done());
	}

	_afterPromptThemelets(answers) {
		const themeletDependencies =
			project.themeConfig.config.themeletDependencies || {};

		const reducedThemelets = this._reduceThemelets(
			answers,
			themeletDependencies,
			item => this._reducePkgData(item)
		);

		const removedThemelets = answers.removedThemelets;

		if (removedThemelets) {
			project.removeDependencies(removedThemelets);
		}

		project.themeConfig.setConfig({
			themeletDependencies: reducedThemelets,
		});

		const dependencies = this._reduceThemelets(answers);

		this._saveDependencies(dependencies);

		if (answers.addedThemelets.length) {
			this._installDependencies(dependencies, () => this.done());
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
			const config = {
				selectedModules: this._getSelectedModules(themelet),
				themelet,
			};

			if (themeSource === 'global') {
				GlobalModulePrompt.prompt(
					config,
					this._afterPromptModule.bind(this)
				);
			} else if (themeSource === 'npm') {
				NPMModulePrompt.prompt(
					config,
					this._afterPromptModule.bind(this)
				);
			} else if (themeSource === 'url') {
				URLPackagePrompt.prompt(
					config,
					this._afterPromptModule.bind(this)
				);
			}
		}
	}

	_filterExtendType(input) {
		this._extendType = input;

		return input;
	}

	_getDependencyInstallationArray(dependencies) {
		const themeVersion = project.themeConfig.config.version;

		return _.map(dependencies, item => {
			const pathOrURL = item.__realPath__ || item.__packageURL__;

			return (
				pathOrURL ||
				item.name + this._getDistTag(item, themeVersion, '@')
			);
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
		const baseTheme = project.themeConfig.config.baseTheme;

		let selectedModules;

		if (themelet) {
			selectedModules = _.map(
				project.themeConfig.config.themeletDependencies,
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
			{
				name: 'Specify a package URL',
				value: 'url',
			},
		];

		if (extendType === 'theme') {
			const baseThemeChoices = [
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

	_installDependencies(dependencies, cb) {
		const modules = this._getDependencyInstallationArray(dependencies);

		const args = ['install', ...modules];

		const child = spawn('npm', args, {stdio: 'inherit'});

		let done = false;

		const finalize = () => {
			if (!done) {
				done = true;
				cb();
			}
		};

		child.on('error', error => {
			// eslint-disable-next-line no-console
			console.log.bind(error);

			finalize();
		});

		child.on('exit', code => {
			if (code) {
				const command = `npm ${args.join(' ')}`;

				// eslint-disable-next-line no-console
				console.log(`Command: \`${command}\` exited with code ${code}`);
			}

			finalize();
		});
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
		const __realPath__ = pkg.__realPath__;

		pkg = _.pick(pkg, ['liferayTheme', 'name', 'publishConfig', 'version']);

		if (__realPath__) {
			pkg.path = __realPath__;
		}

		return pkg;
	}

	_reduceThemelets(answers, accumulator, reduceFunction) {
		const modulePackages = answers.modules;
		const reduceAccumulator = accumulator || {};
		const reduce = reduceFunction || (item => item);

		const reducedThemelets = _.reduce(
			answers.addedThemelets,
			(result, item) => {
				result[item] = reduce(modulePackages[item]);

				return result;
			},
			reduceAccumulator
		);

		const removedThemelets = answers.removedThemelets;

		if (removedThemelets) {
			_.forEach(removedThemelets, item => {
				delete reducedThemelets[item];
			});
		}

		return reducedThemelets;
	}

	_saveDependencies(updatedData) {
		const themeVersion = project.themeConfig.config.version;

		const dependencies = _.reduce(
			updatedData,
			(result, item) => {
				const moduleVersion =
					item.__realPath__ ||
					item.__packageURL__ ||
					this._getDistTag(item, themeVersion);

				result[item.name] = moduleVersion;

				return result;
			},
			{}
		);

		project.setDependencies(dependencies);
	}

	_setStaticBaseTheme(themeSource) {
		const baseTheme = project.themeConfig.config.baseTheme;

		if (_.isObject(baseTheme)) {
			project.removeDependencies([baseTheme.name]);
		}

		project.themeConfig.setConfig({
			baseTheme: themeSource,
		});

		this.done();
	}
}

ExtendPrompt.prompt = (config, cb) => new ExtendPrompt(config, cb);

module.exports = ExtendPrompt;
